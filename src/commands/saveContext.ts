import * as vscode from "vscode"
import { ConfigurationService } from "../services/configurationService"
import { LayoutService } from "../services/layoutService"
import { ProjectContext } from "../models/types"

export class SaveContextCommand {
  constructor(
    private configService: ConfigurationService,
    private layoutService: LayoutService,
  ) {}

  async execute(): Promise<void> {
    try {
      // Get context name from user
      const name = await vscode.window.showInputBox({
        prompt: "Enter a name for this context",
        placeHolder: "e.g., Development Setup, Debug Layout",
      })

      if (!name) {
        return
      }

      // Capture current layout
      const layout = await this.layoutService.captureCurrentLayout()

      // Create context
      const context: ProjectContext = {
        id: Date.now().toString(),
        name,
        lastAccessed: new Date(),
        layout,
      }

      // Save context
      await this.configService.saveContext(context)

      // Set as current context
      this.layoutService.setCurrentContext(context)

      vscode.window.showInformationMessage(`Context "${name}" saved and selected!`)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save context: ${error}`)
    }
  }
}
