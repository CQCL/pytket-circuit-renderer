# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), but with the addition of some third-level headings:

- "test" for changes to test code
- "internal" for other, non-user-visible changes to code

This is to allow user-facing information to be more easily extracted from this changelog.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.7.2] 2023-11-21
### Added:
- CS, CSdg gates ready for pytket 1.22
- GateInfo support for PauliPair, PauliCommutingSet boxes

## [0.7.1] 2023-11-13
### Fixed:
- Quantum control state rendering for 0 states

## [0.7.0] 2023-10-02
### Added:
- Handle ConjugationBox, MultiplexedTensoredU2Box info displays
- Support for 0-valued control states

### Changed:
- Update ToffoliBox, StatePreparationBox info displays
- Barrier styling
- Multiplexor boxes displayed with explicit controls
- Classical conditions use new control display

## [0.6.4] 2023-07-10
### Changed:
- Default render options now disable zx-styles and enable the system theme.

### Fixed:
- Scrolling events passed on to parent when the circuit container is fully scrolled.

## [0.6.3] 2023-06-05
### Added:
- Gate info for DiagonalBox and ToffoliBox.
- System theme render option.

### Fixed
- Backgrounds no longer removed by default when printing to pdf.

## [0.6.2] 2023-04-24
### Added:
- Gate info for StatePreparationBox optype.

### Fixed:
- 'Expand parameter expression' render option color in dark mode.

## [0.6.1] 2023-03-13
### Changed:
- Refactor mathjs to reduce component size.

### Fixed
- Allow scrolling on the render options menu.

## [0.6.0] 2023-03-08
### Changed:
- Controlled gates now display as large blocks, and recursive display is enabled for controlled sub-circuits.
- Updated UI icons to make their functionality clearer.
- Parameter expressions are by default evaluated for display.

### Added:
- Transparent background toggle to render options.
- Truncate long params render option (enabled by default). When disabled, long parameters are displayed in full.
- Note about SVG image export.

## [0.5.0] 2023-01-30
### Added:
- Added render option for transparent background.
- Gate info for new Pytket box types: Toffoli, MultiplexorBox, Multiplexed2qBox, MultiplexedRotationBox.

### Changed:
- Theme updated to match quantinuum-ui 2.0

### Fixed:
- Gates with no args now display in the circuit.

## [0.4.2] 2022-11-28
### Fixed
- Extra info display for nested gates

## [0.4.1] 2022-11-21
### Added
- Renderer now updates when changes are made to the circuit json dumped to the DOM
### Fixed
- Scrolling issue within navigator on moz browsers.

## [0.4.0] 2022-11-15
### Added
- Navigator wrapper for the circuit.
- Dark theme render option.
- Way to initialise the render options.

### Changed:
- Render options now behind a menu.

### Fixed
- Gate name for custom gates uses the user defined name.

## [0.3.1] 2022-10-18
### Fixed
- Individual condensed classical wires now display correctly.

## [0.3.0] 2022-10-10
### Internal
- Un-revert: Refactor code to optimise rendering.

### Added
- Un-revert: New gates introduced in pytket 1.6.

## [0.2.2] 2022-10-06
### Fixed
- Revert changes that require different vue config option.

## [0.2.1] 2022-10-03
### Fixed
- White background added in for dark theme compatibility.

### Test
- Add cypress and storybook, basic tests.

### Internal
- Refactor code to optimise rendering computations.

### Added
- Option to export rendered circuits as images.
- New gates introduced in pytket 1.6

## [0.2.0] 2022-07-13
### Added
- QIR support: classical controls, self controls, classical expressions, WASM.
- Collapse individual classical registers independently.
- Option to zoom circuits.

### Test
- Add sample circuits to test page.

## [0.1.7] 2022-07-12
### Fixed
- Barrier displays.
- Higher dimensional registers now display correctly.
- Fix nested circuit extra info.

## [0.1.6] 2022-06-22
### Fixed
- Scoped styles now use sass.

## [0.1.5] 2022-06-21
### Added
- Support for UnitaryTableau box types.
- Scoped styles.

## [0.1.4] 2022-05-31
### Fixed
- Missing classical gates when classical wires are condensed now display properly.

### Added
- Changelog.

## [0.1.3] 2022-05-24
Initial release
### Added
- Rendering module for pytket circuits.


