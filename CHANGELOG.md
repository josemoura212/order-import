# Changelog

All notable changes to the "Order Import" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.5] - 2025-12-22

### Added
- Material-UI import optimization for better tree-shaking
- Import grouping by type (external, alias, relative)
- Configurable path aliases support
- Keyboard shortcut (Ctrl+Alt+R / Cmd+Alt+R) for manual organization
- Comprehensive JSDoc documentation across all modules
- Command to toggle MUI optimization
- Blank line separators between import groups
- Support for multiple MUI packages (@mui/material, @mui/icons-material, etc.)

### Changed
- Improved import classification algorithm
- Enhanced code organization with professional documentation
- Updated configuration options with better descriptions
- Refactored code into separate modules (types, commands, importOrganizer)

### Fixed
- Side-effect imports (fix-ts-path) now properly recognized and prioritized
- Import regex updated to handle all import variations

## [0.0.4] - 2025-12-22

### Added
- Side-effect import support
- Fix-ts-path import prioritization
- Modular code structure

### Changed
- Improved import detection regex
- Better code organization

## [0.0.3] - 2025-12-21

### Added
- ESLint and Prettier configuration
- Husky pre-commit hooks
- Lint-staged for automatic code formatting
- Keywords for better discoverability

### Changed
- Code formatting standards
- Project structure improvements

## [0.0.2] - 2025-12-21

### Added
- Two format styles (Normal and Aligned)
- Configuration options
- Toggle format on save command

### Changed
- Improved import sorting algorithm

## [0.0.1] - 2025-12-20

### Added
- Initial release
- Basic import organization functionality
- Automatic formatting on save
- Support for JavaScript/TypeScript/React files
- Separate named and default imports
- Alphabetical sorting by path

[0.0.5]: https://github.com/josemoura212/order-import/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/josemoura212/order-import/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/josemoura212/order-import/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/josemoura212/order-import/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/josemoura212/order-import/releases/tag/v0.0.1
