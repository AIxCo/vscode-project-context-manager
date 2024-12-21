# VS Code Project Context Manager Extension

## Goal

Create a VS Code extension that manages multiple project contexts by saving and restoring window layouts and open files. The extension should allow quick switching between different project contexts while maintaining the exact window arrangement and file positions.

## Core Features

### 1. Project Context Management

- Store multiple project contexts in a configuration file
- Each context includes:
  - Open files and their locations
  - Window/pane layout configuration
  - Editor group arrangements
- Quick switching between different project contexts

### 2. Window Layout Management

- Capture current window layout including:
  - Split editor arrangements (horizontal/vertical)
  - Editor group positions
  - Active editor in each group
  - Panel states (terminal, output, etc.)
- Restore exact window configurations when switching contexts

### 3. Context Commands

- Save current context (`Ctrl+Shift+P -> Save Project Context`)
- Switch between contexts (`Ctrl+Shift+P -> Switch Project Context`)
- Edit/Delete contexts
- Export/Import context configurations

## Technical Architecture

### Extension Structure

```
vs-code-underscore-extension/
├── src/
│   ├── extension.ts                # Extension entry point
│   ├── commands/
│   │   ├── saveContext.ts         # Save current window state
│   │   ├── switchContext.ts       # Switch between contexts
│   │   └── manageContexts.ts      # Edit/delete contexts
│   ├── models/
│   │   ├── projectContext.ts      # Context data structure
│   │   └── windowLayout.ts        # Window layout structure
│   └── services/
│       ├── configurationService.ts # Handle JSON configuration
│       ├── layoutService.ts       # Window management
│       └── storageService.ts      # Persistent storage
├── package.json
└── README.md
```

### Data Structures

```typescript
interface ProjectContext {
  id: string;
  name: string;
  description?: string;
  lastAccessed: Date;
  layout: WindowLayout;
}

interface WindowLayout {
  editorGroups: EditorGroup[];
  activeGroup: number;
  terminals?: TerminalConfig[];
}

interface EditorGroup {
  id: number;
  position: {
    column: number;
    row: number;
  };
  size: number; // Relative size in split
  files: OpenFile[];
  activeFile?: string;
}

interface OpenFile {
  path: string;
  viewColumn: number;
  scroll?: {
    line: number;
    character: number;
  };
}

interface TerminalConfig {
  name?: string;
  cwd?: string;
  isVisible: boolean;
}
```

### Configuration Storage

```json
{
  "version": "1.0",
  "contexts": {
    "project1": {
      "id": "project1",
      "name": "Backend Development",
      "layout": {
        "editorGroups": [
          {
            "id": 1,
            "position": { "column": 1, "row": 1 },
            "size": 0.5,
            "files": [
              {
                "path": "/src/api/users.ts",
                "viewColumn": 1
              }
            ]
          }
        ],
        "activeGroup": 1
      }
    }
  }
}
```

## Implementation Flow

### Saving Context

1. Capture current window state using VS Code API
   - `vscode.window.tabGroups`
   - `vscode.window.activeTextEditor`
   - Editor group layouts
2. Convert to ProjectContext structure
3. Save to configuration file

### Switching Context

1. Load target context from configuration
2. Close current files (optionally)
3. Restore window layout
4. Open files in specified positions
5. Restore editor group arrangements
6. Focus on previously active editor

## Key VS Code APIs

```typescript
// Main APIs we'll use
vscode.window.createEditorGroup()
vscode.window.tabGroups
vscode.workspace.openTextDocument()
vscode.window.showTextDocument()
vscode.window.activeTextEditor
```

## Notes

- Store configuration in user's settings directory
- Use relative paths when possible for file locations
- Handle missing files gracefully
- Provide quick switch command with recently used contexts
- Consider workspace vs user level configurations
- Add status bar item for quick context switching

## Future Enhancements

1. Workspace-specific configurations
2. Context sharing via gist/file
3. Auto-context based on git branch
4. Terminal state preservation
5. Custom layout templates

## Implementation Progress

### Phase 1: Basic Setup and Core Structure ✅

- [x] Project scaffolding and basic extension setup
- [x] Implement basic models (ProjectContext, WindowLayout)
- [x] Setup configuration service
- [x] Add basic command registration

### Phase 2: Context Management ✅

- [x] Implement save context functionality
- [x] Implement context storage service
- [x] Add context listing and switching
- [x] Basic window layout capture

### Phase 3: Window Management ✅

- [x] Implement window layout restoration
- [x] Handle editor groups and positions
- [x] Manage file opening and positioning
- [x] Terminal state management

### Phase 4: User Interface 🚧

- [ ] Add command palette integration
- [ ] Create status bar item
- [ ] Add context quick pick
- [ ] Implement settings and configuration UI

### Phase 5: Polish and Enhancement 🚧

- [ ] Error handling and validation
- [ ] Progress indicators
- [ ] Documentation
- [ ] Performance optimization

## Next Steps

1. Test the basic functionality
2. Add status bar integration for quick access
3. Implement settings UI for managing contexts
4. Add keyboard shortcuts
5. Write documentation
