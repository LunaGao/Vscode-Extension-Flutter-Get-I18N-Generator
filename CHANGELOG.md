# Change Log

All notable changes to the "fluttergeti18ngenerator" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- No unreleased changes yet.

## [0.2.0] - 2026-03-27

### Removed

- Remove CSV auto translate feature and related configuration.
- Remove unused CSV header tags such as `[base]`.

### Changed

- Update generated `keys` structure to match the demo output style.
- Update generated `getSelectLocale()` logic to match the demo implementation.
- Refactor the extension command flow and shared i18n helper logic.
- Improve extension metadata and release documentation.

### Fixed

- Use consistent UTF-8 decoding for CSV and iOS string files.
- Escape generated Dart strings more safely.
- Validate `app_i18n.csv` structure before generation.
- Await iOS string file writes correctly.
- Harden `InfoPlist.strings` updates.
- Unify iOS locale matching behavior.

### Developer

- Add structured output channel logging for failures.
- Enable stricter TypeScript compiler checks.
- Refresh ESLint configuration.
- Add core unit tests and CI validation workflow.

## [0.1.5] - 2025-09-29

- Try other get device locale function.

## [0.1.4] - 2025-09-29

- Fix first open app in Chinese language will always display Hant error.

## [0.1.3] - 2023-10-26

- Fix a little bug.

## [0.1.2] - 2023-10-26

- Fix Windows can not generate app_i18n.dart file error.

## [0.1.1] - 2023-9-16

- Fix app_i18n.csv generate to dart file error.

## [0.1.0] - 2023-9-9

- Add app_i18n.csv key column `[ignore]` tag for translate function.
- Fix app_i18n.csv generate to dart file error.

## [0.0.10] - 2023-9-4

- Add iOS native i18n sync function.

## [0.0.9] - 2023-9-4

- Fix app_i18n.dart zh-Hant and zh-Hans error.

## [0.0.8] - 2023-9-3

- Fix app_i18n.dart getSelectLocale logic error.

## [0.0.7] - 2023-9-2

- Add Translate function by Rapid's Microsoft Translate api.

## [0.0.6] - 2023-7-18

- Add `List<Locale> supportedLocales` function.

## [0.0.2] - 2023-7-9

- Fix alert message.

## [0.0.1] - 2023-7-9
