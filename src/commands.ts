import * as vscode from "vscode";
import { organizeImports } from "./importOrganizer";

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

      const status = !currentValue ? "ATIVADA" : "DESATIVADA";
      vscode.window.showInformationMessage(
        `Order Import: Formatação ao salvar ${status}`
      );
    }
  );

  context.subscriptions.push(toggleFormatOnSave);
}

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
        "Order Import: Tipo 1 (Normal) ativado"
      );
    }
  );

  context.subscriptions.push(selectNormal);
}

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
        "Order Import: Tipo 2 (Alinhado) ativado"
      );
    }
  );

  context.subscriptions.push(selectAligned);
}

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
