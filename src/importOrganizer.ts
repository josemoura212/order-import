import * as vscode from "vscode";
import { ImportStatement } from "./types";

function optimizeMuiImports(imports: ImportStatement[]): void {
  const newImports: ImportStatement[] = [];

  for (let i = imports.length - 1; i >= 0; i--) {
    const imp = imports[i];

    if (
      imp.isNamed &&
      (imp.path.includes("@mui/material") ||
        imp.path.includes("@mui/icons-material") ||
        imp.path.includes("@mui/lab") ||
        imp.path.includes("@mui/x-data-grid") ||
        imp.path.includes("@mui/x-date-pickers"))
    ) {
      const componentsMatch = imp.named.match(/{([^}]+)}/);
      if (componentsMatch) {
        const components = componentsMatch[1]
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);

        if (components.length > 0) {
          const basePath = imp.path.replace(/['"]/g, "");

          for (const component of components) {
            newImports.push({
              full: `import ${component} from '${basePath}/${component}';`,
              named: component,
              path: `'${basePath}/${component}'`,
              isNamed: false,
              isAsterisk: false,
              isFixTsPath: false,
              isSideEffect: false,
            });
          }

          imports.splice(i, 1);
        }
      }
    }
  }

  imports.push(...newImports);
}

export function organizeImports(
  document: vscode.TextDocument,
  forceStyle?: string
): vscode.TextEdit[] {
  const text = document.getText();
  const lines = text.split("\n");

  const importRegex =
    /^import\s+(?:(?:{[^}]+}|(?:\*\s+as\s+)?[\w]+)\s+from\s+)?['"][^'"]+['"];?$/;

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

      const regularMatch = line.match(
        /^import\s+((?:{[^}]+}|(?:\*\s+as\s+)?[\w]+))\s+from\s+(['"][^'"]+['"])/
      );
      const sideEffectMatch = line.match(/^import\s+(['"][^'"]+['"]);?$/);

      if (regularMatch) {
        const named = regularMatch[1];
        const path = regularMatch[2];
        const isAsterisk = named.startsWith("*");
        const isFixTsPath = path.includes("fix-ts-path");
        imports.push({
          full: line,
          named: named,
          path: path,
          isNamed: named.startsWith("{"),
          isAsterisk: isAsterisk,
          isFixTsPath: isFixTsPath,
          isSideEffect: false,
        });
      } else if (sideEffectMatch) {
        const path = sideEffectMatch[1];
        const isFixTsPath = path.includes("fix-ts-path");
        imports.push({
          full: line,
          named: "",
          path: path,
          isNamed: false,
          isAsterisk: false,
          isFixTsPath: isFixTsPath,
          isSideEffect: true,
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
  const muiOptimization = config.get<boolean>("muiOptimization", false);

  if (muiOptimization) {
    optimizeMuiImports(imports);
  }

  const fixTsPathImports = imports.filter((imp) => imp.isFixTsPath);
  const asteriskImports = imports.filter(
    (imp) => !imp.isFixTsPath && !imp.isSideEffect && imp.isAsterisk
  );
  const namedImports = imports.filter(
    (imp) =>
      !imp.isFixTsPath && !imp.isSideEffect && !imp.isAsterisk && imp.isNamed
  );
  const defaultImports = imports.filter(
    (imp) =>
      !imp.isFixTsPath && !imp.isSideEffect && !imp.isAsterisk && !imp.isNamed
  );

  fixTsPathImports.sort((a, b) => a.path.localeCompare(b.path));
  asteriskImports.sort((a, b) => a.path.localeCompare(b.path));
  namedImports.sort((a, b) => a.path.localeCompare(b.path));
  defaultImports.sort((a, b) => a.path.localeCompare(b.path));

  let allFormattedImports: string[];

  if (formatStyle === "aligned") {
    const allImports = [
      ...fixTsPathImports,
      ...asteriskImports,
      ...namedImports,
      ...defaultImports,
    ];
    const maxLength = Math.max(...allImports.map((imp) => imp.named.length));

    const formattedFixTsPath = fixTsPathImports.map((imp) => {
      if (imp.isSideEffect) {
        return `import ${imp.path};`;
      }
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });

    const formattedAsterisk = asteriskImports.map((imp) => {
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });

    const formattedNamed = namedImports.map((imp) => {
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });

    const formattedDefault = defaultImports.map((imp) => {
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });

    allFormattedImports = [
      ...formattedFixTsPath,
      ...formattedAsterisk,
      ...formattedNamed,
      ...formattedDefault,
    ];
  } else {
    fixTsPathImports.sort((a, b) => a.named.length - b.named.length);
    asteriskImports.sort((a, b) => a.named.length - b.named.length);
    namedImports.sort((a, b) => a.named.length - b.named.length);
    defaultImports.sort((a, b) => a.named.length - b.named.length);

    const formattedFixTsPath = fixTsPathImports.map((imp) => {
      if (imp.isSideEffect) {
        return `import ${imp.path};`;
      }
      return `import ${imp.named} from ${imp.path};`;
    });

    const formattedAsterisk = asteriskImports.map((imp) => {
      return `import ${imp.named} from ${imp.path};`;
    });

    const formattedNamed = namedImports.map((imp) => {
      return `import ${imp.named} from ${imp.path};`;
    });

    const formattedDefault = defaultImports.map((imp) => {
      return `import ${imp.named} from ${imp.path};`;
    });

    allFormattedImports = [
      ...formattedFixTsPath,
      ...formattedAsterisk,
      ...formattedNamed,
      ...formattedDefault,
    ];
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
