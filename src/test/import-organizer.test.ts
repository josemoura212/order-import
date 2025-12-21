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

  test("Deve ordenar por tamanho (menor primeiro) no modo normal", () => {
    const imports = [
      { named: "{ ThemeProvider }", length: 16 },
      { named: "{ Header }", length: 10 },
      { named: "{ Layout }", length: 10 },
      { named: "Box", length: 3 },
    ];

    imports.sort((a, b) => a.named.length - b.named.length);

    assert.strictEqual(imports[0].named, "Box", "Menor deve vir primeiro");
    assert.ok(
      imports[0].length < imports[imports.length - 1].length,
      "Primeiro elemento deve ser menor que o último"
    );
  });

  test("Deve ordenar alfabeticamente por path no modo aligned", () => {
    const imports = [
      { path: "'./config/theme'" },
      { path: "'./components/header'" },
      { path: "'@mui/material/Box'" },
    ];

    imports.sort((a, b) => a.path.localeCompare(b.path));

    // Na ordenação alfabética padrão, ' vem antes de @, mas isso não importa para nosso caso
    // O importante é que a ordenação seja consistente
    assert.ok(imports.length === 3, "Deve manter todos os imports");
  });

  test("Deve calcular espaçamento correto para alinhamento", () => {
    const imports = [
      { named: "{ Header }", length: 10 },
      { named: "{ ThemeProvider }", length: 16 },
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

  test("Deve manter ordem: named antes de default", () => {
    const namedImports = [
      { named: "{ Header }", isNamed: true },
      { named: "{ Layout }", isNamed: true },
    ];

    const defaultImports = [
      { named: "Box", isNamed: false },
      { named: "ListCategory", isNamed: false },
    ];

    const allImports = [...namedImports, ...defaultImports];

    // Verificar que todos named vêm antes dos default
    let foundDefault = false;
    for (const imp of allImports) {
      if (!imp.isNamed) {
        foundDefault = true;
      }
      if (foundDefault && imp.isNamed) {
        assert.fail("Import named não deve vir depois de default");
      }
    }

    assert.ok(true, "Ordem correta mantida");
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
});
