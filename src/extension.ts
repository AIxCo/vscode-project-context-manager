// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import { ConfigurationService } from "./services/configurationService"
import { LayoutService } from "./services/layoutService"
import { SaveContextCommand } from "./commands/saveContext"
import { SwitchContextCommand } from "./commands/switchContext"
import { OverrideContextCommand } from "./commands/overrideContext"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("Starting Project Context Manager activation...")

  try {
    // Register a simple test command first
    const testDisposable = vscode.commands.registerCommand("project-context-manager.test", () => {
      vscode.window.showInformationMessage("Test command works!")
    })
    context.subscriptions.push(testDisposable)

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
    statusBarItem.text = "$(layout) Project Context"
    statusBarItem.tooltip = "Click to manage project contexts"
    statusBarItem.command = "project-context-manager.switchContext"
    statusBarItem.show()
    context.subscriptions.push(statusBarItem)

    // Initialize services
    console.log("Initializing services...")
    const configService = new ConfigurationService(context)
    const layoutService = new LayoutService()

    // Initialize commands
    console.log("Initializing commands...")
    const saveContextCommand = new SaveContextCommand(configService, layoutService)
    const switchContextCommand = new SwitchContextCommand(configService, layoutService)
    const overrideContextCommand = new OverrideContextCommand(configService, layoutService)

    // Register commands
    console.log("Registering commands...")
    const saveDisposable = vscode.commands.registerCommand("project-context-manager.saveContext", () =>
      saveContextCommand.execute(),
    )
    const switchDisposable = vscode.commands.registerCommand("project-context-manager.switchContext", () =>
      switchContextCommand.execute(),
    )
    const overrideDisposable = vscode.commands.registerCommand("project-context-manager.overrideContext", () =>
      overrideContextCommand.execute(),
    )

    context.subscriptions.push(saveDisposable, switchDisposable, overrideDisposable)

    // Show welcome message
    vscode.window.showInformationMessage("Project Context Manager is now active!")
    console.log("Project Context Manager extension is now active!")
  } catch (error) {
    console.error("Failed to activate Project Context Manager:", error)
    throw error
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Project Context Manager extension is being deactivated.")
}
