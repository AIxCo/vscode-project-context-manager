import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import { ProjectContext } from "../models/types"

export class FileStorageService {
  private readonly configFileName = "project-contexts.json"
  private configFilePath: string

  constructor() {
    // Get the workspace root folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    if (!workspaceFolder) {
      throw new Error("No workspace folder found")
    }

    // Store in .vscode folder to keep it with project settings
    const vscodePath = path.join(workspaceFolder.uri.fsPath, ".vscode")
    if (!fs.existsSync(vscodePath)) {
      fs.mkdirSync(vscodePath)
    }

    this.configFilePath = path.join(vscodePath, this.configFileName)
    this.ensureConfigFile()
  }

  private ensureConfigFile(): void {
    if (!fs.existsSync(this.configFilePath)) {
      fs.writeFileSync(this.configFilePath, JSON.stringify({ contexts: {} }, null, 2))
    }
  }

  async getAllContexts(): Promise<{ [key: string]: ProjectContext }> {
    try {
      const content = await fs.promises.readFile(this.configFilePath, "utf-8")
      const data = JSON.parse(content)
      return data.contexts || {}
    } catch (error) {
      console.error("Failed to read contexts:", error)
      return {}
    }
  }

  async saveContext(context: ProjectContext): Promise<void> {
    try {
      const contexts = await this.getAllContexts()
      contexts[context.id] = context

      await fs.promises.writeFile(this.configFilePath, JSON.stringify({ contexts }, null, 2), "utf-8")
    } catch (error) {
      throw new Error(`Failed to save context: ${error}`)
    }
  }

  async deleteContext(id: string): Promise<void> {
    try {
      const contexts = await this.getAllContexts()
      delete contexts[id]

      await fs.promises.writeFile(this.configFilePath, JSON.stringify({ contexts }, null, 2), "utf-8")
    } catch (error) {
      throw new Error(`Failed to delete context: ${error}`)
    }
  }

  async clearAllContexts(): Promise<void> {
    try {
      await fs.promises.writeFile(this.configFilePath, JSON.stringify({ contexts: {} }, null, 2), "utf-8")
    } catch (error) {
      throw new Error(`Failed to clear contexts: ${error}`)
    }
  }
}
