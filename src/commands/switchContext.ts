import * as vscode from "vscode"
import { ConfigurationService } from "../services/configurationService"
import { LayoutService } from "../services/layoutService"
import { ProjectContext } from "../models/types"

export class SwitchContextCommand {
  constructor(
    private configService: ConfigurationService,
    private layoutService: LayoutService,
  ) {}

  async execute(): Promise<void> {
    try {
      const contexts = await this.configService.getAllContexts()
      const contextList = Object.values(contexts)

      if (contextList.length === 0) {
        vscode.window.showInformationMessage("No saved contexts found.")
        return
      }

      // Sort contexts by last accessed
      contextList.sort((a, b) => {
        const dateA = new Date(a.lastAccessed)
        const dateB = new Date(b.lastAccessed)
        return dateB.getTime() - dateA.getTime()
      })

      // Create quick pick items
      const items = contextList.map((context) => ({
        label: context.name,
        description: new Date(context.lastAccessed).toLocaleString(),
        detail: this.layoutService.getCurrentContext()?.id === context.id ? "Currently Selected" : undefined,
        context,
      }))

      // Show quick pick
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a context to switch to",
      })

      if (!selected) {
        return
      }

      // Update last accessed
      selected.context.lastAccessed = new Date()
      await this.configService.saveContext(selected.context)

      // Store the selected context
      this.layoutService.setCurrentContext(selected.context)

      // Restore layout
      await this.layoutService.restoreLayout(selected.context.layout)

      vscode.window.showInformationMessage(`Switched to context "${selected.context.name}"`)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to switch context: ${error}`)
    }
  }
}
