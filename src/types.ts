export interface ImportStatement {
  full: string;
  named: string;
  path: string;
  isNamed: boolean;
  isAsterisk: boolean;
  isFixTsPath: boolean;
  isSideEffect: boolean;
}
