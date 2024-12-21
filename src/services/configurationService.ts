import * as vscode from "vscode"
import { ProjectContext } from "../models/types"
import { FileStorageService } from "./fileStorageService"

export class ConfigurationService {
  private fileStorage: FileStorageService

  constructor(private context: vscode.ExtensionContext) {
    this.fileStorage = new FileStorageService()
  }

  async saveContext(context: ProjectContext): Promise<void> {
    try {
      await this.fileStorage.saveContext(context)
    } catch (error) {
      throw new Error(`Failed to save context: ${error}`)
    }
  }

  async getContext(id: string): Promise<ProjectContext | undefined> {
    try {
      const contexts = await this.fileStorage.getAllContexts()
      return contexts[id]
    } catch (error) {
      throw new Error(`Failed to get context: ${error}`)
    }
  }

  async getAllContexts(): Promise<{ [key: string]: ProjectContext }> {
    try {
      return await this.fileStorage.getAllContexts()
    } catch (error) {
      throw new Error(`Failed to get all contexts: ${error}`)
    }
  }

  async deleteContext(id: string): Promise<void> {
    try {
      await this.fileStorage.deleteContext(id)
    } catch (error) {
      throw new Error(`Failed to delete context: ${error}`)
    }
  }

  async clearAllContexts(): Promise<void> {
    try {
      await this.fileStorage.clearAllContexts()
    } catch (error) {
      throw new Error(`Failed to clear contexts: ${error}`)
    }
  }
}
