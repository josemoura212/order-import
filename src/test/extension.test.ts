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

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("formatStyle", "normal", vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());
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

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("formatStyle", "aligned", vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();

    assert.ok(text.includes("from"), "Deve conter a palavra from");

    const lines = text.split("\n").filter((l) => l.trim());
    const paths = lines.map((l) => {
      const match = l.match(/from\s+(['"][^'"]+['"])/);
      return match ? match[1] : "";
    });

    assert.ok(
      paths[0] === "'./components/header'" ||
        paths[0] === '"./components/header"'
    );
    assert.ok(
      paths[1] === "'./components/layout'" ||
        paths[1] === '"./components/layout"'
    );

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

    const initialValue = config.get("organizeOnSave");

    await vscode.commands.executeCommand("order-import.toggleFormatOnSave");
    await new Promise((resolve) => setTimeout(resolve, 500));

    config = vscode.workspace.getConfiguration("orderImport");
    const newValue = config.get("organizeOnSave");
    assert.strictEqual(
      newValue,
      !initialValue,
      "Deve alternar o valor de organizeOnSave"
    );

    await config.update(
      "organizeOnSave",
      initialValue,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Deve alternar entre tipo 1 (normal) e tipo 2 (alinhado)", async function () {
    this.timeout(10000);

    let config = vscode.workspace.getConfiguration("orderImport");

    await vscode.commands.executeCommand("order-import.selectNormal");
    await new Promise((resolve) => setTimeout(resolve, 500));

    config = vscode.workspace.getConfiguration("orderImport");
    let formatStyle = config.get("formatStyle");
    assert.strictEqual(formatStyle, "normal", "Deve configurar para normal");

    await vscode.commands.executeCommand("order-import.selectAligned");
    await new Promise((resolve) => setTimeout(resolve, 500));

    config = vscode.workspace.getConfiguration("orderImport");
    formatStyle = config.get("formatStyle");
    assert.strictEqual(formatStyle, "aligned", "Deve configurar para aligned");
  });

  test("Deve processar imports mistos (default + named) em categoria separada", async function () {
    this.timeout(10000);
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useState, memo } from 'react';
import Box from '@mui/material/Box';
import { AgencyModel } from './models/agency.model';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("formatStyle", "normal", vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());
    assert.ok(
      text.includes("PopupState, { bindMenu, bindTrigger }"),
      "Import misto deve estar presente e completo"
    );

    const agency_line = lines.findIndex((l) => l.includes("{ AgencyModel }"));
    const useState_line = lines.findIndex((l) =>
      l.includes("{ useState, memo }")
    );
    const mixed_line = lines.findIndex((l) =>
      l.includes("PopupState, { bindMenu")
    );
    const box_line = lines.findIndex(
      (l) => l.includes("Box") && l.includes("@mui")
    );

    assert.ok(
      agency_line < useState_line,
      "Named menor deve vir antes de named maior"
    );
    assert.ok(useState_line < mixed_line, "Named deve vir antes de mixed");
    assert.ok(mixed_line < box_line, "Mixed deve vir antes de default");
  });

  test("Não deve otimizar imports de @mui/material/styles", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import { alpha } from '@mui/material/styles';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("muiOptimization", true, vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());
    assert.ok(
      lines.some(
        (l) => l.includes("{ alpha }") && l.includes("@mui/material/styles")
      ),
      "Import de alpha deve permanecer como named import de styles"
    );

    assert.ok(
      lines.some((l) => l.includes("{ styled }") && l.includes("@mui/system")),
      "Import de styled deve permanecer como named import de system"
    );

    assert.ok(
      lines.some((l) => l.includes("Box") && l.includes("@mui/material/Box")),
      "Import de Box deve ser otimizado para caminho direto"
    );
  });

  test("Não deve otimizar imports do @mui/x-data-grid", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import { GridToolbar } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { ChartsBar } from '@mui/x-charts';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("muiOptimization", true, vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());

    // Verifica se os imports MUI-X NÃO foram convertidos para imports diretos (devem permanecer como named imports)
    assert.ok(
      lines.some(
        (l) =>
          l.includes("GridToolbar") &&
          l.includes("@mui/x-data-grid'") &&
          l.includes("{ GridToolbar }")
      ),
      "Import de GridToolbar NÃO deve ser convertido para caminho direto"
    );

    assert.ok(
      lines.some(
        (l) =>
          l.includes("DatePicker") &&
          l.includes("@mui/x-date-pickers'") &&
          l.includes("{ DatePicker }")
      ),
      "Import de DatePicker NÃO deve ser convertido para caminho direto"
    );

    assert.ok(
      lines.some(
        (l) =>
          l.includes("ChartsBar") &&
          l.includes("@mui/x-charts'") &&
          l.includes("{ ChartsBar }")
      ),
      "Import de ChartsBar NÃO deve ser convertido para caminho direto"
    );
  });

  test("Não deve otimizar imports do @mui/x- com alias", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import { DataGrid as MuiDataGrid, GridToolbar as Toolbar } from '@mui/x-data-grid';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("muiOptimization", true, vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());

    // Verifica se os imports com alias NÃO foram convertidos (devem permanecer como named imports)
    assert.ok(
      lines.some(
        (l) =>
          l.includes("MuiDataGrid") &&
          l.includes("@mui/x-data-grid'") &&
          l.includes("DataGrid as MuiDataGrid")
      ),
      "Import de DataGrid com alias NÃO deve ser convertido"
    );

    assert.ok(
      lines.some(
        (l) =>
          l.includes("Toolbar") &&
          l.includes("@mui/x-data-grid'") &&
          l.includes("GridToolbar as Toolbar")
      ),
      "Import de GridToolbar com alias NÃO deve ser convertido"
    );
  });

  test("Não deve otimizar import específico do @mui/x-data-grid mencionado pelo usuário", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: `import { GridFilterModel } from '@mui/x-data-grid';`,
    });

    const editor = await vscode.window.showTextDocument(doc);

    await vscode.workspace
      .getConfiguration("orderImport")
      .update("muiOptimization", true, vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("order-import.organizeImports");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const text = editor.document.getText();
    const lines = text.split("\n").filter((l) => l.trim());

    // Verifica se o import NÃO foi convertido (deve permanecer como named import)
    assert.ok(
      lines.some(
        (l) =>
          l.includes("GridFilterModel") &&
          l.includes("@mui/x-data-grid'") &&
          l.includes("{ GridFilterModel }")
      ),
      "Import de GridFilterModel NÃO deve ser convertido para caminho direto"
    );
  });
});
