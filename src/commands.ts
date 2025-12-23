/**
 * Command registration functions for the Order Import extension.
 *
 * This module provides command registration utilities that handle:
 * - Format on save toggle
 * - Format style selection (normal/aligned)
 * - MUI optimization toggle
 * - Manual import organization
 *
 * @module commands
 */

import * as vscode from "vscode";
import { organizeImports } from "./importOrganizer";

/**
 * Registers the toggle format-on-save command.
 *
 * Allows users to enable/disable automatic import organization when saving files.
 * The setting is stored globally and persists across VS Code sessions.
 *
 * @param context - The extension context for registering subscriptions
 *
 * @example
 * ```typescript
 * registerToggleFormatOnSave(context);
 * // Command: 'order-import.toggleFormatOnSave'
 * ```
 */
export function registerToggleFormatOnSave(
  context: vscode.ExtensionContext
): void {
  const toggleFormatOnSave = vscode.commands.registerCommand(
    "order-import.toggleFormatOnSave",
    async () => {
      const config = vscode.workspace.getConfiguration("orderImport");
      const currentValue = config.get<boolean>("organizeOnSave", true);
      await config.update(
        "organizeOnSave",
        !currentValue,
        vscode.ConfigurationTarget.Global
      );

      const message = !currentValue
        ? "Order Import: Format on save ENABLED"
        : "Order Import: Format on save DISABLED";
      vscode.window.showInformationMessage(message);
    }
  );

  context.subscriptions.push(toggleFormatOnSave);
}

/**
 * Registers the select normal format style command.
 *
 * Sets the import format style to 'normal' which organizes imports
 * by the length of their names (shortest first) with single space before 'from'.
 *
 * @param context - The extension context for registering subscriptions
 */
export function registerSelectNormal(context: vscode.ExtensionContext): void {
  const selectNormal = vscode.commands.registerCommand(
    "order-import.selectNormal",
    async () => {
      const config = vscode.workspace.getConfiguration("orderImport");
      await config.update(
        "formatStyle",
        "normal",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        "Order Import: Type 1 (Normal) enabled"
      );
    }
  );

  context.subscriptions.push(selectNormal);
}

/**
 * Registers the select aligned format style command.
 *
 * Sets the import format style to 'aligned' which organizes imports
 * alphabetically by path and aligns all 'from' keywords vertically.
 *
 * @param context - The extension context for registering subscriptions
 */
export function registerSelectAligned(context: vscode.ExtensionContext): void {
  const selectAligned = vscode.commands.registerCommand(
    "order-import.selectAligned",
    async () => {
      const config = vscode.workspace.getConfiguration("orderImport");
      await config.update(
        "formatStyle",
        "aligned",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(
        "Order Import: Type 2 (Aligned) enabled"
      );
    }
  );

  context.subscriptions.push(selectAligned);
}

/**
 * Registers the toggle MUI optimization command.
 *
 * Enables/disables Material-UI import optimization for better tree-shaking.
 * When enabled, converts barrel imports to direct component imports:
 * `import { Button } from '@mui/material'` → `import Button from '@mui/material/Button'`
 *
 * @param context - The extension context for registering subscriptions
 *
 * @see https://mui.com/material-ui/guides/minimizing-bundle-size/
 */
export function registerToggleMuiOptimization(
  context: vscode.ExtensionContext
): void {
  const toggleMuiOptimization = vscode.commands.registerCommand(
    "order-import.toggleMuiOptimization",
    async () => {
      const config = vscode.workspace.getConfiguration("orderImport");
      const currentValue = config.get<boolean>("muiOptimization", false);
      await config.update(
        "muiOptimization",
        !currentValue,
        vscode.ConfigurationTarget.Global
      );

      const message = !currentValue
        ? "Order Import: MUI Optimization ENABLED"
        : "Order Import: MUI Optimization DISABLED";
      vscode.window.showInformationMessage(message);
    }
  );

  context.subscriptions.push(toggleMuiOptimization);
}

/**
 * Registers the manual organize imports command.
 *
 * Provides a command to manually trigger import organization in the active editor.
 * This is useful when format-on-save is disabled or for quick formatting.
 *
 * Keyboard shortcut: Ctrl+Alt+R (Cmd+Alt+R on Mac)
 *
 * @param context - The extension context for registering subscriptions
 */
export function registerOrganizeImportsCommand(
  context: vscode.ExtensionContext
): void {
  const organizeImportsCommand = vscode.commands.registerCommand(
    "order-import.organizeImports",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const edits = organizeImports(editor.document);
        editor.edit((editBuilder) => {
          edits.forEach((edit) => {
            editBuilder.replace(edit.range, edit.newText);
          });
        });
      }
    }
  );

  context.subscriptions.push(organizeImportsCommand);
}
