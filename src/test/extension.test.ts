import * as assert from "assert";
import * as vscode from "vscode";

suite("Order Import Extension Test Suite", () => {
  vscode.window.showInformationMessage(
    "Iniciando testes da extensão Order Import"
  );

  test("Deve ordenar imports no modo normal (por tamanho)", async function () {
    this.timeout(10000);
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import { ThemeProvider } from '@mui/material/styles';
import { Header } from './components/header';
import Box from '@mui/material/Box';
import { Layout } from './components/layout';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    // Configurar modo normal
    await vscode.workspace
      .getConfiguration("orderImport")
      .update("formatStyle", "normal", vscode.ConfigurationTarget.Global);

    // Executar comando de formatação
    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n");

    // Verificar se imports com {} vêm primeiro
    assert.ok(
      lines[0].includes("{ Header }"),
      "Primeiro import deve ser { Header }"
    );
    assert.ok(
      lines[1].includes("{ Layout }"),
      "Segundo import deve ser { Layout }"
    );
    assert.ok(
      lines[2].includes("{ ThemeProvider }"),
      "Terceiro import deve ser { ThemeProvider }"
    );

    // Verificar se imports sem {} vêm depois
    assert.ok(lines[3].includes("Box"), "Quarto import deve ser Box (default)");
  });

  test("Deve ordenar imports no modo alinhado (alfabético por path)", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import { Header } from './components/header';
import Box from '@mui/material/Box';
import { Layout } from './components/layout';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    // Configurar modo alinhado
    await vscode.workspace
      .getConfiguration("orderImport")
      .update("formatStyle", "aligned", vscode.ConfigurationTarget.Global);

    // Executar comando de formatação
    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();

    // Verificar se está alinhado pelo from
    assert.ok(text.includes("from"), "Deve conter a palavra from");

    // Verificar ordem alfabética dos paths
    const lines = text.split("\n").filter((l) => l.trim());
    const paths = lines.map((l) => {
      const match = l.match(/from\s+(['"][^'"]+['"])/);
      return match ? match[1] : "";
    });

    // Paths dos imports com {}
    assert.ok(
      paths[0] === "'./components/header'" ||
        paths[0] === '"./components/header"'
    );
    assert.ok(
      paths[1] === "'./components/layout'" ||
        paths[1] === '"./components/layout"'
    );

    // Path do import sem {}
    assert.ok(paths[2].includes("@mui/material/Box"));
  });

  test("Deve separar imports named ({}) de default", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import Box from '@mui/material/Box';
import { Header } from './components/header';
import ListCategory from './features/list';
import { Layout } from './components/layout';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());

    // Encontrar onde começam os imports sem {}
    let defaultImportIndex = -1;
    let lastNamedImportIndex = -1;

    lines.forEach((line, index) => {
      if (line.includes("{")) {
        lastNamedImportIndex = index;
      } else if (line.includes("import") && !line.includes("{")) {
        if (defaultImportIndex === -1) {
          defaultImportIndex = index;
        }
      }
    });

    // Verificar que imports com {} vêm antes dos sem {}
    if (lastNamedImportIndex !== -1 && defaultImportIndex !== -1) {
      assert.ok(
        lastNamedImportIndex < defaultImportIndex,
        "Imports com {} devem vir antes dos imports sem {}"
      );
    }
  });

  test("Deve ativar/desativar formatação ao salvar", async function () {
    this.timeout(10000);

    let config = vscode.workspace.getConfiguration("orderImport");

    // Verificar estado inicial
    const initialValue = config.get("organizeOnSave");

    // Toggle
    await vscode.commands.executeCommand("order-import.toggleFormatOnSave");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Recarregar config
    config = vscode.workspace.getConfiguration("orderImport");
    const newValue = config.get("organizeOnSave");
    assert.strictEqual(
      newValue,
      !initialValue,
      "Deve alternar o valor de organizeOnSave"
    );

    // Restaurar valor inicial
    await config.update(
      "organizeOnSave",
      initialValue,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Deve alternar entre tipo 1 (normal) e tipo 2 (alinhado)", async function () {
    this.timeout(10000);

    let config = vscode.workspace.getConfiguration("orderImport");

    // Selecionar tipo 1
    await vscode.commands.executeCommand("order-import.selectNormal");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Recarregar config
    config = vscode.workspace.getConfiguration("orderImport");
    let formatStyle = config.get("formatStyle");
    assert.strictEqual(formatStyle, "normal", "Deve configurar para normal");

    // Selecionar tipo 2
    await vscode.commands.executeCommand("order-import.selectAligned");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Recarregar config novamente
    config = vscode.workspace.getConfiguration("orderImport");
    formatStyle = config.get("formatStyle");
    assert.strictEqual(formatStyle, "aligned", "Deve configurar para aligned");
  });
});
