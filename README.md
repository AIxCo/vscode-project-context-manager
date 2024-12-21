# Project Context Manager for VS Code

Save and restore VS Code window layouts and project contexts with ease. This extension helps you maintain multiple window arrangements for different development scenarios and switch between them quickly.

## Features

- **Save Window Layouts**: Capture your current VS Code window arrangement including split editors, file positions, and panel states
- **Quick Context Switching**: Instantly switch between different saved layouts
- **Keyboard Shortcuts**:
  - Save Layout: `Ctrl+Alt+S` (Windows/Linux) or `Cmd+Alt+S` (Mac)
  - Switch Layout: `Ctrl+Alt+L` (Windows/Linux) or `Cmd+Alt+L` (Mac)
  - Override Layout: `Ctrl+Alt+O` (Windows/Linux) or `Cmd+Alt+O` (Mac)
- **Status Bar Integration**: Quick access to layouts through the VS Code status bar

## Usage

### Saving a Layout

1. Arrange your VS Code windows and editors as desired
2. Press `Ctrl+Alt+S` (`Cmd+Alt+S` on Mac) or use the command palette:
   - Press `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac)
   - Type "Project Context: Save Current Layout"
3. Enter a name for your layout when prompted

### Switching Layouts

1. Press `Ctrl+Alt+L` (`Cmd+Alt+L` on Mac) or click the Project Context status bar item
2. Select the desired layout from the quick pick menu

### Overriding a Layout

1. Arrange your windows as desired
2. Press `Ctrl+Alt+O` (`Cmd+Alt+O` on Mac)
3. Select the layout you want to override

## Requirements

- VS Code version 1.83.0 or higher

## Extension Settings

This extension contributes the following settings:

- `projectContextManager.saveOnSwitch`: Enable/disable automatic saving of the current layout before switching
- `projectContextManager.closeUnusedFiles`: Enable/disable closing files not part of the target layout when switching

## Known Issues

Please report issues on our [GitHub repository](https://github.com/aixco/project-context-manager/issues).

## Release Notes

### 0.0.1

Initial release of Project Context Manager:

- Basic layout saving and restoration
- Keyboard shortcuts
- Status bar integration
- Context switching functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](https://github.com/aix-labs/project-context-manager/blob/main/LICENSE).
