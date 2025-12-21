import * as vscode from "vscode";

interface ImportStatement {
  full: string;
  named: string;
  path: string;
  isNamed: boolean;
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Order Import extension is now active!");

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
      vscode.window.showInformationMessage(`Formatação ao salvar ${status}`);
    }
  );

  const selectNormal = vscode.commands.registerCommand(
    "order-import.selectNormal",
    async () => {
      const config = vscode.workspace.getConfiguration("orderImport");
      await config.update(
        "formatStyle",
        "normal",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("Tipo 1 (Normal) ativado");
    }
  );

  const selectAligned = vscode.commands.registerCommand(
    "order-import.selectAligned",
    async () => {
      const config = vscode.workspace.getConfiguration("orderImport");
      await config.update(
        "formatStyle",
        "aligned",
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("Tipo 2 (Alinhado) ativado");
    }
  );

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

  context.subscriptions.push(
    toggleFormatOnSave,
    selectNormal,
    selectAligned,
    organizeImportsCommand
  );
}

function organizeImports(
  document: vscode.TextDocument,
  forceStyle?: string
): vscode.TextEdit[] {
  const text = document.getText();
  const lines = text.split("\n");

  const importRegex = /^import\s+(?:{[^}]+}|[\w]+)\s+from\s+['"][^'"]+['"];?$/;

  let importStartLine = -1;
  let importEndLine = -1;
  const imports: ImportStatement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (importRegex.test(line)) {
      if (importStartLine === -1) {
        importStartLine = i;
      }
      importEndLine = i;

      const match = line.match(
        /^import\s+((?:{[^}]+}|[\w]+))\s+from\s+(['"][^'"]+['"])/
      );
      if (match) {
        const named = match[1];
        const path = match[2];
        imports.push({
          full: line,
          named: named,
          path: path,
          isNamed: named.startsWith("{"),
        });
      }
    } else if (importEndLine !== -1 && line && !line.startsWith("//")) {
      break;
    }
  }

  if (imports.length === 0) {
    return [];
  }

  const config = vscode.workspace.getConfiguration("orderImport");
  const formatStyle =
    forceStyle || config.get<string>("formatStyle", "aligned");

  const namedImports = imports.filter((imp) => imp.isNamed);
  const defaultImports = imports.filter((imp) => !imp.isNamed);

  namedImports.sort((a, b) => a.path.localeCompare(b.path));
  defaultImports.sort((a, b) => a.path.localeCompare(b.path));

  let allFormattedImports: string[];

  if (formatStyle === "aligned") {
    const allImports = [...namedImports, ...defaultImports];
    const maxLength = Math.max(...allImports.map((imp) => imp.named.length));

    const formattedNamed = namedImports.map((imp) => {
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });

    const formattedDefault = defaultImports.map((imp) => {
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });

    allFormattedImports = [...formattedNamed, ...formattedDefault];
  } else {
    namedImports.sort((a, b) => a.named.length - b.named.length);
    defaultImports.sort((a, b) => a.named.length - b.named.length);

    const formattedNamed = namedImports.map((imp) => {
      return `import ${imp.named} from ${imp.path};`;
    });

    const formattedDefault = defaultImports.map((imp) => {
      return `import ${imp.named} from ${imp.path};`;
    });

    allFormattedImports = [...formattedNamed, ...formattedDefault];
  }

  const startPos = new vscode.Position(importStartLine, 0);
  const endPos = new vscode.Position(
    importEndLine,
    lines[importEndLine].length
  );
  const range = new vscode.Range(startPos, endPos);

  const newText = allFormattedImports.join("\n");

  return [vscode.TextEdit.replace(range, newText)];
}

export function deactivate() {}
