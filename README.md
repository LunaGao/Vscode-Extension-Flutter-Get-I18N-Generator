# fluttergeti18ngenerator README

Generate app_i18n.dart file by app_i18n.csv file. For [GetX](https://pub.dev) plugin.
You can check [here](https://pub.dev/packages/get#internationalization) to learn how to use it.

## Features

Generate app_i18n.dart file by app_i18n.csv file.

Max language transtlate count is 20.

## Requirements

Translate using [Microsoft Translator Text](https://rapidapi.com/microsoft-azure-org-microsoft-cognitive-services/api/microsoft-translator-text/) by Rapid Api.

So you need to have an API Key from [https://rapidapi.com](https://rapidapi.com)


## Extension Settings

Include if your extension adds any VS Code settings through the `fluttergeti18ngenerator.enableordisablefluttergeti18ngenerator` extension point.

`Flutter Enable/Disable app_i18n.csv Generator`
`Flutter Enable/Disable app_i18n.csv Translate`
`Flutter Set Microsoft Translate Rapid Api Key`

## Known Issues

None

## Release Notes

### 0.0.7

Add Translate function by Rapid's Microsoft Translate api.

### 0.0.6

Add `List<Locale> supportedLocales` function.

---

### 0.0.1

Init

---