import * as vscode from "vscode"
import { ConfigurationService } from "../services/configurationService"
import { LayoutService } from "../services/layoutService"

export class OverrideContextCommand {
  constructor(
    private configService: ConfigurationService,
    private layoutService: LayoutService,
  ) {}

  async execute(): Promise<void> {
    try {
      const currentContext = this.layoutService.getCurrentContext()
      if (!currentContext) {
        vscode.window.showWarningMessage("No layout is currently selected. Please switch to a layout first.")
        return
      }

      const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to override "${currentContext.name}"?`,
        { modal: true },
        "Yes, Override",
        "Cancel",
      )

      if (confirmation !== "Yes, Override") {
        return
      }

      // Capture current layout
      const layout = await this.layoutService.captureCurrentLayout()

      // Update the context with new layout but keep the same ID and name
      const updatedContext = {
        ...currentContext,
        lastAccessed: new Date(),
        layout,
      }

      // Save the updated context
      await this.configService.saveContext(updatedContext)
      this.layoutService.setCurrentContext(updatedContext)

      vscode.window.showInformationMessage(`Layout "${updatedContext.name}" has been updated!`)
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to override layout: ${error}`)
    }
  }
}
