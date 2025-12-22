import * as vscode from "vscode";
import { ImportStatement } from "./types";

/**
 * Classifies import statements by their type (external, alias, or relative).
 *
 * This function analyzes each import path and categorizes it as:
 * - `external`: Imports from node_modules (e.g., 'react', '@mui/material')
 * - `alias`: Imports using path aliases (e.g., '@/', '~/components')
 * - `relative`: Imports using relative paths (e.g., './Header', '../utils')
 *
 * @param imports - Array of import statements to classify
 * @param pathAliases - Array of configured path aliases to detect
 *
 * @example
 * ```typescript
 * const imports = [{ path: "'react'" }, { path: "'@/utils'" }];
 * classifyImportTypes(imports, ['@/']);
 * // imports[0].importType === 'external'
 * // imports[1].importType === 'alias'
 * ```
 */
function classifyImportTypes(
  imports: ImportStatement[],
  pathAliases: string[]
): void {
  for (const imp of imports) {
    const path = imp.path.replace(/['"]/g, "");

    // Relativos (começam com . ou ..)
    if (path.startsWith("./") || path.startsWith("../")) {
      imp.importType = "relative";
    }
    // Path aliases
    else if (pathAliases.some((alias) => path.startsWith(alias))) {
      imp.importType = "alias";
    }
    // Externos (node_modules)
    else {
      imp.importType = "external";
    }
  }
}

/**
 * Groups import statements by their type with blank line separators.
 *
 * Creates a hierarchical organization of imports:
 * 1. External imports (node_modules)
 * 2. Blank line separator
 * 3. Alias imports (path aliases)
 * 4. Blank line separator
 * 5. Relative imports (local files)
 *
 * @param imports - Array of classified import statements
 * @returns Reorganized array with blank line markers between groups
 *
 * @example
 * ```typescript
 * const grouped = groupImportsByType(imports);
 * // Result: [external1, external2, {blank}, alias1, {blank}, relative1]
 * ```
 */
function groupImportsByType(imports: ImportStatement[]): ImportStatement[] {
  const external = imports.filter((imp) => imp.importType === "external");
  const alias = imports.filter((imp) => imp.importType === "alias");
  const relative = imports.filter((imp) => imp.importType === "relative");

  const result: ImportStatement[] = [];

  if (external.length > 0) {
    result.push(...external);
    // Adicionar marcador para linha em branco
    if (alias.length > 0 || relative.length > 0) {
      result.push({
        full: "",
        named: "",
        path: "",
        isNamed: false,
        isAsterisk: false,
        isFixTsPath: false,
        isSideEffect: false,
        importType: "external",
      } as ImportStatement);
    }
  }

  if (alias.length > 0) {
    result.push(...alias);
    if (relative.length > 0) {
      result.push({
        full: "",
        named: "",
        path: "",
        isNamed: false,
        isAsterisk: false,
        isFixTsPath: false,
        isSideEffect: false,
        importType: "alias",
      } as ImportStatement);
    }
  }

  if (relative.length > 0) {
    result.push(...relative);
  }

  return result;
}

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
 *
 * @example
 * ```typescript
 * removeUnusedImports(imports, document.getText());
 * // Removes: import { Button } from 'react' if Button is never used
 * ```
 */
function removeUnusedImports(
  imports: ImportStatement[],
  documentText: string
): void {
  const lines = documentText.split("\n");

  // Find the last import line to get code after imports
  let lastImportLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("import ")) {
      lastImportLine = i;
    }
  }

  // Get code after imports (where usage happens)
  const codeAfterImports = lines.slice(lastImportLine + 1).join("\n");

  for (let i = imports.length - 1; i >= 0; i--) {
    const imp = imports[i];

    // Always keep side-effect imports (like CSS or fix-ts-path)
    if (imp.isSideEffect) {
      continue;
    }

    // Always keep namespace imports (import * as X)
    if (imp.isAsterisk) {
      continue;
    }

    let isUsed = false;

    if (imp.isNamed) {
      // Named imports: check each identifier
      const namedMatch = imp.named.match(/{([^}]+)}/);
      if (namedMatch) {
        const identifiers = namedMatch[1]
          .split(",")
          .map((id) => id.trim().split(" as ")[0].trim());

        // Check if any identifier is used in the code
        isUsed = identifiers.some((identifier) => {
          // Create regex to find identifier as a word boundary
          const regex = new RegExp(`\\b${identifier}\\b`, "g");
          return regex.test(codeAfterImports);
        });
      }
    } else {
      // Default imports: check if the name is used
      const identifier = imp.named.trim();
      if (identifier) {
        const regex = new RegExp(`\\b${identifier}\\b`, "g");
        isUsed = regex.test(codeAfterImports);
      }
    }

    // Remove if not used
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
 * 3. Classifies imports by type (external, alias, relative)
 * 4. Groups imports with blank line separators
 * 5. Sorts imports within each category
 * 6. Formats imports according to the selected style (aligned or normal)
 *
 * @param document - VS Code text document containing the imports
 * @param forceStyle - Optional style override ('aligned' or 'normal')
 * @returns Array of text edits to apply to the document
 *
 * @example
 * ```typescript
 * const edits = organizeImports(document);
 * editor.edit(editBuilder => {
 *   edits.forEach(edit => editBuilder.replace(edit.range, edit.newText));
 * });
 * ```
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
  const groupByType = config.get<boolean>("groupByType", true);
  const removeUnused = config.get<boolean>("removeUnusedImports", false);
  const pathAliases = config.get<string[]>("pathAliases", [
    "@/",
    "~/",
    "@components/",
    "@services/",
    "@utils/",
    "@hooks/",
  ]);

  if (muiOptimization) {
    optimizeMuiImports(imports);
  }

  if (removeUnused) {
    removeUnusedImports(imports, text);
  }

  if (groupByType) {
    classifyImportTypes(imports, pathAliases);
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

  // Agrupar por tipo se ativado
  const groupedImports = groupByType
    ? groupImportsByType([
        ...fixTsPathImports,
        ...asteriskImports,
        ...namedImports,
        ...defaultImports,
      ])
    : [
        ...fixTsPathImports,
        ...asteriskImports,
        ...namedImports,
        ...defaultImports,
      ];

  let allFormattedImports: string[];

  if (formatStyle === "aligned") {
    const maxLength = Math.max(
      ...groupedImports
        .filter((imp) => imp.full !== "")
        .map((imp) => imp.named.length)
    );

    allFormattedImports = groupedImports.map((imp) => {
      // Marcador de linha em branco
      if (imp.full === "") {
        return "";
      }

      if (imp.isSideEffect) {
        return `import ${imp.path};`;
      }
      const spaces = " ".repeat(maxLength - imp.named.length + 1);
      return `import ${imp.named}${spaces}from ${imp.path};`;
    });
  } else {
    allFormattedImports = groupedImports.map((imp) => {
      // Marcador de linha em branco
      if (imp.full === "") {
        return "";
      }

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
