import * as vscode from "vscode"

export interface ProjectContext {
  id: string
  name: string
  description?: string
  lastAccessed: Date
  layout: WindowLayout
}

export interface WindowLayout {
  editorGroups: EditorGroup[]
  activeGroup: number
  terminals?: TerminalConfig[]
}

export interface EditorGroup {
  id: number
  position: {
    column: number
    row: number
  }
  size: number
  files: OpenFile[]
  activeFile?: string
}

export interface OpenFile {
  path: string
  viewColumn: number
  scroll?: {
    line: number
    character: number
  }
}

export interface TerminalConfig {
  name?: string
  cwd?: string
  isVisible: boolean
}
