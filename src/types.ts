/**
 * Represents a single import statement with its metadata.
 *
 * @interface ImportStatement
 *
 * @property {string} full - The complete import statement as a string
 * @property {string} named - The imported name(s) or specifier
 * @property {string} path - The module path (with quotes)
 * @property {boolean} isNamed - Whether it's a named import (uses curly braces)
 * @property {boolean} isAsterisk - Whether it's a namespace import (import * as)
 * @property {boolean} isFixTsPath - Whether it's a fix-ts-path side-effect import
 * @property {boolean} isSideEffect - Whether it's a side-effect only import
 * @property {('external'|'alias'|'relative')} [importType] - Classification of the import source
 *
 * @example
 * ```typescript
 * // Named import
 * { full: "import { Button } from 'react'", named: "{ Button }", path: "'react'", isNamed: true }
 *
 * // Default import
 * { full: "import React from 'react'", named: "React", path: "'react'", isNamed: false }
 *
 * // Side-effect import
 * { full: "import './styles.css'", named: "", path: "'./styles.css'", isSideEffect: true }
 * ```
 */
export interface ImportStatement {
  full: string;
  named: string;
  path: string;
  isNamed: boolean;
  isAsterisk: boolean;
  isFixTsPath: boolean;
  isSideEffect: boolean;
  importType?: "external" | "alias" | "relative";
}

/**
 * Represents a group of imports by their source type.
 *
 * @typedef {Object} ImportGroup
 *
 * @property {('external'|'alias'|'relative')} type - The type of imports in this group
 * @property {ImportStatement[]} imports - Array of import statements in this group
 *
 * @example
 * ```typescript
 * const externalGroup: ImportGroup = {
 *   type: 'external',
 *   imports: [reactImport, muiImport]
 * };
 * ```
 */
export type ImportGroup = {
  type: "external" | "alias" | "relative";
  imports: ImportStatement[];
};
