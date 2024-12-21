import * as vscode from "vscode"
import { WindowLayout, EditorGroup, OpenFile, ProjectContext } from "../models/types"
import * as path from "path"

export class LayoutService {
  private currentContext: ProjectContext | null = null
  private workspaceRoot: string

  constructor() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    if (!workspaceFolder) {
      throw new Error("No workspace folder found")
    }
    this.workspaceRoot = workspaceFolder.uri.fsPath
  }

  getCurrentContext(): ProjectContext | null {
    return this.currentContext
  }

  setCurrentContext(context: ProjectContext | null): void {
    this.currentContext = context
  }

  async captureCurrentLayout(): Promise<WindowLayout> {
    const tabGroups = vscode.window.tabGroups
    const editorGroups: EditorGroup[] = []
    let activeGroup = 0

    console.log("Starting capture of current layout...")
    console.log("Number of tab groups:", tabGroups.all.length)

    // Create a map to store the actual layout structure
    const layoutMap = new Map<number, { row: number; column: number }>()

    // First pass: determine the actual layout structure
    tabGroups.all.forEach((group) => {
      const viewColumn = group.viewColumn || 1
      console.log(`Group ${viewColumn}:`, {
        isActive: group.isActive,
        activeTab: group.tabs.find((tab) => tab.isActive)?.label,
        viewColumn,
      })

      // Store the actual position of this view column
      // We'll need to inspect the actual positions during debugging
      layoutMap.set(viewColumn, {
        row: 0, // We'll calculate this based on what we see
        column: 0,
      })
    })

    // Now process each group
    tabGroups.all.forEach((group) => {
      const activeTab = group.tabs.find((tab) => tab.isActive)
      if (activeTab && activeTab.input instanceof vscode.TabInputText) {
        const viewColumn = group.viewColumn || 1
        const relativePath = path.relative(this.workspaceRoot, activeTab.input.uri.fsPath)

        if (group.isActive) {
          activeGroup = viewColumn
        }

        const files: OpenFile[] = [
          {
            path: relativePath,
            viewColumn: viewColumn,
          },
        ]

        // Capture scroll position if this is the active editor
        if (vscode.window.activeTextEditor?.document.uri.fsPath === activeTab.input.uri.fsPath) {
          files[0].scroll = {
            line: vscode.window.activeTextEditor.visibleRanges[0]?.start.line || 0,
            character: vscode.window.activeTextEditor.visibleRanges[0]?.start.character || 0,
          }
        }

        // Get the actual position from the editor layout
        const position = layoutMap.get(viewColumn) || { row: 1, column: viewColumn }

        editorGroups.push({
          id: viewColumn,
          position: position,
          size: 1 / tabGroups.all.length, // Equal size for now
          files,
          activeFile: relativePath,
        })
      }
    })

    console.log("Captured editor groups:", editorGroups)

    return {
      editorGroups,
      activeGroup,
      terminals: await this.captureTerminals(),
    }
  }

  private async captureTerminals(): Promise<{ name?: string; cwd?: string; isVisible: boolean }[]> {
    const terminals = vscode.window.terminals
    return terminals.map((terminal) => ({
      name: terminal.name,
      // We'll store undefined for now since VS Code API doesn't provide direct access to terminal CWD
      cwd: undefined,
      isVisible: terminal.name === vscode.window.activeTerminal?.name,
    }))
  }

  private getEditorLayout(): {
    groups: {
      viewColumn: number
      position: { column: number; row: number }
      size: number
    }[]
  } {
    const groups: {
      viewColumn: number
      position: { row: number; column: number }
      size: number
    }[] = []
    const tabGroups = vscode.window.tabGroups.all
    const totalGroups = tabGroups.length

    // Compute a balanced grid using row-major order (unified approach)
    const numColumns = Math.ceil(Math.sqrt(totalGroups))
    const numRows = Math.ceil(totalGroups / numColumns)

    tabGroups.forEach((group, index) => {
      const viewColumn = group.viewColumn || 1
      const row = Math.floor(index / numColumns) + 1
      const column = (index % numColumns) + 1

      groups.push({
        viewColumn,
        position: { row, column },
        size: 1 / totalGroups, // Keep a simple size distribution
      })
    })

    return { groups }
  }

  async restoreLayout(layout: WindowLayout): Promise<void> {
    // Close all current editors
    await vscode.commands.executeCommand("workbench.action.closeAllEditors")

    // First, create the editor groups with the correct layout
    await this.restoreEditorGroups(layout.editorGroups)

    // Then restore files in each group
    for (const group of layout.editorGroups) {
      for (const file of group.files) {
        try {
          // Convert relative path to absolute path
          const absolutePath = path.join(this.workspaceRoot, file.path)
          const document = await vscode.workspace.openTextDocument(absolutePath)
          await vscode.window.showTextDocument(document, {
            viewColumn: file.viewColumn,
            preserveFocus: true,
          })

          if (file.scroll) {
            const editor = vscode.window.activeTextEditor
            if (editor) {
              const position = new vscode.Position(file.scroll.line, file.scroll.character)
              editor.selection = new vscode.Selection(position, position)
              editor.revealRange(new vscode.Range(position, position))
            }
          }
        } catch (error) {
          console.error(`Failed to open file: ${file.path}`, error)
        }
      }
    }

    // Restore active group and file
    if (layout.activeGroup) {
      const activeGroup = layout.editorGroups.find((g) => g.id === layout.activeGroup)
      if (activeGroup?.activeFile) {
        try {
          // Convert relative path to absolute path
          const absolutePath = path.join(this.workspaceRoot, activeGroup.activeFile)
          const document = await vscode.workspace.openTextDocument(absolutePath)
          await vscode.window.showTextDocument(document, {
            viewColumn: activeGroup.position.column,
            preserveFocus: false,
          })
        } catch (error) {
          console.error(`Failed to restore active file: ${activeGroup.activeFile}`, error)
        }
      }
    }

    // Restore terminals
    if (layout.terminals) {
      for (const terminal of layout.terminals) {
        const cwd = terminal.cwd ? path.join(this.workspaceRoot, terminal.cwd) : undefined
        const newTerminal = vscode.window.createTerminal({
          name: terminal.name,
          cwd,
        })
        if (terminal.isVisible) {
          newTerminal.show()
        }
      }
    }
  }

  private async restoreEditorGroups(groups: EditorGroup[]): Promise<void> {
    // Sort groups by row first, then column
    const sortedGroups = [...groups].sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row
      }
      return a.position.column - b.position.column
    })

    // Close all editors first
    await vscode.commands.executeCommand("workbench.action.closeAllEditors")

    // Create the initial editor
    if (sortedGroups.length === 0) return

    // Handle the first group
    const firstGroup = sortedGroups[0]
    if (firstGroup.files.length > 0) {
      const absolutePath = path.join(this.workspaceRoot, firstGroup.files[0].path)
      const document = await vscode.workspace.openTextDocument(absolutePath)
      await vscode.window.showTextDocument(document, { preserveFocus: true })
    }

    // Track the current row we're working on
    let currentRow = 1

    // Create the rest of the layout
    for (let i = 1; i < sortedGroups.length; i++) {
      const group = sortedGroups[i]

      if (group.position.row > currentRow) {
        // New row needed
        await vscode.commands.executeCommand("workbench.action.splitEditorDown")
        currentRow = group.position.row
      } else {
        // Same row, split right
        await vscode.commands.executeCommand("workbench.action.splitEditorRight")
      }

      // Open the file in this new split
      if (group.files.length > 0) {
        const absolutePath = path.join(this.workspaceRoot, group.files[0].path)
        const document = await vscode.workspace.openTextDocument(absolutePath)
        await vscode.window.showTextDocument(document, { preserveFocus: true })
      }
    }
  }
}
