/**
 * Order Import - VS Code Extension
 *
 * Automatically organizes and formats import statements in JavaScript/TypeScript files.
 *
 * Features:
 * - Automatic formatting on save
 * - Multiple format styles (normal and aligned)
 * - Material-UI import optimization for tree-shaking
 * - Import grouping by type (external, alias, relative)
 * - Custom path alias support
 * - Side-effect import prioritization (fix-ts-path)
 *
 * @author JosAugusto
 * @license MIT
 */

import * as vscode from "vscode";
import { organizeImports } from "./importOrganizer";
import {
  registerToggleFormatOnSave,
  registerSelectNormal,
  registerSelectAligned,
  registerToggleMuiOptimization,
  registerOrganizeImportsCommand,
} from "./commands";

/**
 * Activates the Order Import extension.
 *
 * Sets up the document save listener for automatic import organization
 * and registers all available commands.
 *
 * The save listener operates on:
 * - JavaScript (.js, .jsx)
 * - TypeScript (.ts, .tsx)
 *
 * @param context - The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext): void {
  let isFormatting = false;

  const saveListener = vscode.workspace.onWillSaveTextDocument((event) => {
    const document = event.document;

    if (isFormatting) {
      return;
    }

    const config = vscode.workspace.getConfiguration("orderImport");
    const organizeOnSave = config.get<boolean>("organizeOnSave", true);

    if (!organizeOnSave) {
      return;
    }

    if (
      ![
        "javascript",
        "typescript",
        "javascriptreact",
        "typescriptreact",
      ].includes(document.languageId)
    ) {
      return;
    }

    isFormatting = true;
    event.waitUntil(
      Promise.resolve(organizeImports(document)).then((edits) => {
        setTimeout(() => {
          isFormatting = false;
        }, 100);
        return edits;
      })
    );
  });

  context.subscriptions.push(saveListener);

  registerToggleFormatOnSave(context);
  registerSelectNormal(context);
  registerSelectAligned(context);
  registerToggleMuiOptimization(context);
  registerOrganizeImportsCommand(context);
}

/**
 * Deactivates the extension.
 *
 * Called when the extension is deactivated. Currently performs no cleanup
 * as all subscriptions are automatically disposed by VS Code.
 */
export function deactivate(): void {}
