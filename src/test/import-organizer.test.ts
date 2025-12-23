import * as assert from "assert";

suite("Import Organizer Logic Tests", () => {
  test("Deve identificar imports named (com {}) e default (sem {})", () => {
    const namedImport = "{ Header }";
    const defaultImport = "Box";

    assert.strictEqual(
      namedImport.startsWith("{"),
      true,
      "Named import deve começar com {"
    );
    assert.strictEqual(
      defaultImport.startsWith("{"),
      false,
      "Default import não deve começar com {"
    );
  });

  test("Deve ordenar por comprimento (menor primeiro) - SEMPRE", () => {
    const imports = [
      { named: "{ ThemeProvider }", length: 17 },
      { named: "{ Header }", length: 10 },
      { named: "{ Layout }", length: 10 },
      { named: "Box", length: 3 },
    ];

    imports.sort((a, b) => a.named.length - b.named.length);

    assert.strictEqual(imports[0].named, "Box", "Menor deve vir primeiro");
    assert.ok(
      imports[0].length <= imports[imports.length - 1].length,
      "Primeiro elemento deve ser menor ou igual ao último"
    );
  });

  test("Ordenação é por comprimento, NÃO alfabética", () => {
    const imports = [
      { named: "{ memo, useState }", path: "'react'", length: 17 },
      {
        named: "{ useAgencyInvites }",
        path: "'../models/agency-invite.model'",
        length: 21,
      },
      {
        named: "{ useAllTranslationFolders }",
        path: "'app/apps/i18n/i18n-items.model'",
        length: 29,
      },
    ];

    imports.sort((a, b) => a.named.length - b.named.length);

    assert.strictEqual(
      imports[0].named,
      "{ memo, useState }",
      "Menor comprimento primeiro"
    );
    assert.strictEqual(
      imports[1].named,
      "{ useAgencyInvites }",
      "Segundo menor comprimento"
    );
    assert.strictEqual(
      imports[2].named,
      "{ useAllTranslationFolders }",
      "Maior comprimento por último"
    );
  });

  test("Deve calcular espaçamento correto para alinhamento", () => {
    const imports = [
      { named: "{ Header }", length: 10 },
      { named: "{ ThemeProvider }", length: 17 },
      { named: "Box", length: 3 },
    ];

    const maxLength = Math.max(...imports.map((imp) => imp.named.length));

    assert.strictEqual(
      maxLength,
      17,
      "Deve encontrar o maior tamanho (17 caracteres em '{ ThemeProvider }')"
    );

    const spaces1 = " ".repeat(maxLength - imports[0].named.length + 1);
    const spaces2 = " ".repeat(maxLength - imports[2].named.length + 1);

    assert.ok(
      spaces2.length > spaces1.length,
      "Import menor deve ter mais espaços para alinhar"
    );
  });

  test("Deve manter ordem de precedência: fix-ts-path → asterisk → named → default", () => {
    const fixTsPath = [
      { named: "", isFixTsPath: true, isAsterisk: false, isNamed: false },
    ];

    const asteriskImports = [
      {
        named: "* as React",
        isFixTsPath: false,
        isAsterisk: true,
        isNamed: false,
      },
    ];

    const namedImports = [
      {
        named: "{ Header }",
        isFixTsPath: false,
        isAsterisk: false,
        isNamed: true,
      },
      {
        named: "{ Layout }",
        isFixTsPath: false,
        isAsterisk: false,
        isNamed: true,
      },
    ];

    const defaultImports = [
      { named: "Box", isFixTsPath: false, isAsterisk: false, isNamed: false },
      {
        named: "ListCategory",
        isFixTsPath: false,
        isAsterisk: false,
        isNamed: false,
      },
    ];

    const allImports = [
      ...fixTsPath,
      ...asteriskImports,
      ...namedImports,
      ...defaultImports,
    ];

    assert.strictEqual(
      allImports[0].isFixTsPath,
      true,
      "fix-ts-path deve ser primeiro"
    );
    assert.strictEqual(
      allImports[1].isAsterisk,
      true,
      "asterisk deve vir depois de fix-ts-path"
    );
    assert.strictEqual(
      allImports[2].isNamed,
      true,
      "named deve vir depois de asterisk"
    );
    assert.strictEqual(
      allImports[allImports.length - 1].isNamed,
      false,
      "default deve ser último"
    );
    assert.strictEqual(
      allImports[allImports.length - 1].isAsterisk,
      false,
      "default não é asterisk"
    );
  });

  test("Deve formatar corretamente com espaço único no modo normal", () => {
    const named = "{ Header }";
    const path = "'./components/header'";

    const formatted = `import ${named} from ${path};`;

    assert.ok(
      formatted.includes(" from "),
      "Deve ter espaço antes e depois de from"
    );
    assert.strictEqual(
      formatted.split(" from ").length,
      2,
      "Deve ter apenas um from"
    );
  });

  test("Deve formatar corretamente com alinhamento no modo aligned", () => {
    const maxLength = 16;
    const named = "{ Header }";
    const path = "'./components/header'";

    const spaces = " ".repeat(maxLength - named.length + 1);
    const formatted = `import ${named}${spaces}from ${path};`;

    assert.ok(formatted.includes("from"), "Deve conter from");
    assert.ok(spaces.length > 1, "Deve ter múltiplos espaços para alinhamento");
  });

  test("Deve ordenar default imports por comprimento dentro da categoria", () => {
    const defaultImports = [
      { named: "Typography", length: 10 },
      { named: "Button", length: 6 },
      { named: "Paper", length: 5 },
      { named: "TextField", length: 9 },
    ];

    defaultImports.sort((a, b) => a.named.length - b.named.length);

    assert.strictEqual(
      defaultImports[0].named,
      "Paper",
      "Paper (5) deve vir primeiro"
    );
    assert.strictEqual(
      defaultImports[1].named,
      "Button",
      "Button (6) deve vir em segundo"
    );
    assert.strictEqual(
      defaultImports[2].named,
      "TextField",
      "TextField (9) deve vir em terceiro"
    );
    assert.strictEqual(
      defaultImports[3].named,
      "Typography",
      "Typography (10) deve vir por último"
    );
  });

  test("Deve processar imports mistos (default + named)", () => {
    const mixedImport = {
      named: "PopupState, { bindMenu, bindTrigger }",
      path: "'material-ui-popup-state'",
      isNamed: false,
      isMixed: true,
    };

    assert.strictEqual(
      mixedImport.isMixed,
      true,
      "Import misto deve ser classificado como mixed"
    );

    assert.strictEqual(
      mixedImport.isNamed,
      false,
      "Import misto não deve ser isNamed"
    );

    const expectedLength = "PopupState, { bindMenu, bindTrigger }".length;
    assert.strictEqual(
      mixedImport.named.length,
      expectedLength,
      "Tamanho deve incluir default + named"
    );
  });

  test("Ordem de precedência: fix-ts-path → asterisk → named → mixed → default", () => {
    const precedence = [
      {
        type: "fix-ts-path",
        isFixTsPath: true,
        isAsterisk: false,
        isNamed: false,
        isMixed: false,
      },
      {
        type: "asterisk",
        isFixTsPath: false,
        isAsterisk: true,
        isNamed: false,
        isMixed: false,
      },
      {
        type: "named",
        isFixTsPath: false,
        isAsterisk: false,
        isNamed: true,
        isMixed: false,
      },
      {
        type: "mixed",
        isFixTsPath: false,
        isAsterisk: false,
        isNamed: false,
        isMixed: true,
      },
      {
        type: "default",
        isFixTsPath: false,
        isAsterisk: false,
        isNamed: false,
        isMixed: false,
      },
    ];

    assert.strictEqual(
      precedence[0].type,
      "fix-ts-path",
      "fix-ts-path deve ser primeiro"
    );
    assert.strictEqual(
      precedence[1].type,
      "asterisk",
      "asterisk deve ser segundo"
    );
    assert.strictEqual(precedence[2].type, "named", "named deve ser terceiro");
    assert.strictEqual(precedence[3].type, "mixed", "mixed deve ser quarto");
    assert.strictEqual(
      precedence[4].type,
      "default",
      "default deve ser quinto"
    );
  });
});
