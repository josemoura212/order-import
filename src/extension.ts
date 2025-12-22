import * as vscode from "vscode";
import { organizeImports } from "./importOrganizer";
import {
  registerToggleFormatOnSave,
  registerSelectNormal,
  registerSelectAligned,
  registerOrganizeImportsCommand,
} from "./commands";

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
  registerOrganizeImportsCommand(context);
}

export function deactivate(): void {}
