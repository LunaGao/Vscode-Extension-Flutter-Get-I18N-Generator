# fluttergeti18ngenerator README

Generate app_i18n.dart file by app_i18n.csv file. For [GetX](https://pub.dev) plugin.
You can check [here](https://pub.dev/packages/get#internationalization) to learn how to use it.

## Example CSV File

Each language column must use the format `locale|display name`.

- `locale`: language code used in generated Dart keys, such as `en_US` or `zh_TW`
- `display name`: label exposed in `key2DisplayValue`

Example:

```
key,en_US|English(US),en_GB|English(UK),en_CA|English(CA),en_AU|English(AU),zh_CN|简体中文,zh_TW|繁體中文,it_IT|italiano,fr_FR|Français,ja_JP|日本語,de_DE|Deutsch,ru_RU|Русский,ar_AE|عربي,hi_IN|हिंदी,pl_PL|Polski,da_DK|dansk,fr_CA|Français (Canada),fi_FI|Suomalainen,ko_KR|한국인,nl_NL|Nederlands,ca_CA|català,cs_CZ|čeština,hr_HR|Hrvatski,ro_RO|Română,ms_MY|Melayu,nb_NO|norsk,pt_BR|Português (Brasil),pt_PT|Português (Portugal),sv_SE|svenska,sk_SK|slovenský,th_TH|แบบไทย,tr_TR|Türkçe,uk_UA|українська,es_MX|Español (México),es_ES|Español (España),he_IL|עִברִית,el_GR|Ελληνικά,hu_HU|Magyar,id_ID|Indonesian,vi_VN|Tiếng Việt
title,Hello,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

```

## Requirements

The extension expects an `app_i18n.csv` file and writes `app_i18n.dart` next to it when auto generation is enabled.

## CSV Rules

- The first column must be `key`.
- At least one language column is required.
- The `title` row is required for the iOS sync command because it is written into `InfoPlist.strings` and App Store metadata.
- Locale headers should use values such as `en_US`, `en`, `zh_CN`, `zh_TW`, `pt_BR`.

## Auto Generation

- Run `Flutter Enable/Disable app_i18n.csv Generator` to enable or disable auto generation.
- When enabled, saving an `app_i18n.csv` file automatically regenerates `app_i18n.dart` in the same folder.
- If CSV validation fails, the extension stops generation and writes details to the `Flutter i18n Generator` output channel.

## iOS Sync Requirements

`Flutter i18n generate iOS i18n` requires an iOS project with these folders already present:

- `ios/Runner/*.lproj/InfoPlist.strings`
- `ios/fastlane/metadata/<locale>/name.txt`

The command reads `lib/i18n/app_i18n.csv` and updates:

- `CFBundleDisplayName` in each `InfoPlist.strings`
- `name.txt` in each Fastlane metadata locale folder

## Extension Settings

Include if your extension adds any VS Code settings through the `fluttergeti18ngenerator.enableordisablefluttergeti18ngenerator` extension point.

* `Flutter Enable/Disable app_i18n.csv Generator`
* `Flutter i18n generate iOS i18n`

## For developer
[publish](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Known Issues

None
