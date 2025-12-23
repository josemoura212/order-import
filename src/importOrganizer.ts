import * as vscode from "vscode";
import { ImportStatement } from "./types";

/**
 * Optimizes Material-UI imports for better tree-shaking and bundle size.
 *
 * Converts named imports from barrel files to direct component imports
 * following MUI's recommended approach for minimizing bundle size:
 *
 * Before: `import { Button, TextField } from '@mui/material';`
 * After:
 * ```typescript
 * import Button from '@mui/material/Button';
 * import TextField from '@mui/material/TextField';
 * ```
 *
 * This optimization applies to all MUI packages:
 * - @mui/material
 * - @mui/icons-material
 * - @mui/lab
 * - @mui/x-data-grid
 * - @mui/x-date-pickers
 *
 * @param imports - Array of import statements to optimize
 *
 * @see https://mui.com/material-ui/guides/minimizing-bundle-size/
 */
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

/**
 * Removes unused imports from the import list.
 *
 * Analyzes the document content to identify which imports are actually used
 * and removes those that are not referenced anywhere in the code.
 *
 * Detection includes:
 * - Named imports: checks if identifiers are used in the code
 * - Default imports: checks if the default name is used
 * - Namespace imports: checks if the namespace is used
 * - Side-effect imports: always kept (cannot be determined if used)
 *
 * @param imports - Array of import statements to filter
 * @param documentText - Full text content of the document
 */
function removeUnusedImports(
  imports: ImportStatement[],
  documentText: string
): void {
  const lines = documentText.split("\n");

  let lastImportLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("import ")) {
      lastImportLine = i;
    }
  }

  const codeAfterImports = lines.slice(lastImportLine + 1).join("\n");

  for (let i = imports.length - 1; i >= 0; i--) {
    const imp = imports[i];

    if (imp.isSideEffect) {
      continue;
    }

    if (imp.isAsterisk) {
      continue;
    }

    let isUsed = false;

    if (imp.isNamed) {
      const namedMatch = imp.named.match(/{([^}]+)}/);
      if (namedMatch) {
        const identifiers = namedMatch[1]
          .split(",")
          .map((id) => id.trim().split(" as ")[0].trim());

        isUsed = identifiers.some((identifier) => {
          const regex = new RegExp(`\\b${identifier}\\b`, "g");
          return regex.test(codeAfterImports);
        });
      }
    } else {
      const identifier = imp.named.trim();
      if (identifier) {
        const regex = new RegExp(`\\b${identifier}\\b`, "g");
        isUsed = regex.test(codeAfterImports);
      }
    }

    if (!isUsed) {
      imports.splice(i, 1);
    }
  }
}

/**
 * Organizes and formats import statements in a VS Code document.
 *
 * Main function that orchestrates the entire import organization process:
 * 1. Extracts all import statements from the document
 * 2. Optionally optimizes MUI imports for tree-shaking
 * 3. Removes unused imports (if enabled)
 * 4. Separates imports by type (fix-ts-path, asterisk, named, default)
 * 5. Sorts imports by length within each category
 * 6. Formats imports according to the selected style (aligned or normal)
 *
 * @param document - VS Code text document containing the imports
 * @param forceStyle - Optional style override ('aligned' or 'normal')
 * @returns Array of text edits to apply to the document
 */
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
  const removeUnused = config.get<boolean>("removeUnusedImports", false);

  if (muiOptimization) {
    optimizeMuiImports(imports);
  }

  if (removeUnused) {
    removeUnusedImports(imports, text);
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

  fixTsPathImports.sort((a, b) => a.named.length - b.named.length);
  asteriskImports.sort((a, b) => a.named.length - b.named.length);
  namedImports.sort((a, b) => a.named.length - b.named.length);
  defaultImports.sort((a, b) => a.named.length - b.named.length);

  const groupedImports = [
    ...fixTsPathImports,
    ...asteriskImports,
    ...namedImports,
    ...defaultImports,
  ];

  let allFormattedImports: string[];

  if (formatStyle === "aligned") {
    const maxLength = Math.max(
      ...groupedImports.map((imp) => imp.named.length)
    );

    allFormattedImports = groupedImports.map((imp) => {
      if (imp.isSideEffect) {
        return `import ${imp.path};`;
      }
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });
  } else {
    allFormattedImports = groupedImports.map((imp) => {
      if (imp.isSideEffect) {
        return `import ${imp.path};`;
      }
      return `import ${imp.named} from ${imp.path};`;
    });
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
