# fluttergeti18ngenerator README

Generate app_i18n.dart file by app_i18n.csv file. For [GetX](https://pub.dev) plugin.
You can check [here](https://pub.dev/packages/get#internationalization) to learn how to use it.

## example csv file
```
key,en_US|English(US)[base],en_GB|English(UK)[ignore],en_CA|English(CA)[ignore],en_AU|English(AU)[ignore],zh_Hans|简体中文[ignore],zh_Hant|繁體中文,it_IT|italiano,fr_FR|Français,ja_JP|日本語,de_DE|Deutsch,ru_RU|Русский,ar_AE|عربي,hi_IN|हिंदी,pl_PL|Polski,da_DK|dansk,fr_CA|Français (Canada),fi_FI|Suomalainen,ko_KR|한국인,nl_NL|Nederlands,ca_CA|català,cs_CZ|čeština,hr_HR|Hrvatski,ro_RO|Română,ms_MY|Melayu,nb_NO|norsk,pt_BR|Português (Brasil),pt_PT|Português (Portugal),sv_SE|svenska,sk_SK|slovenský,th_TH|แบบไทย,tr_TR|Türkçe,uk_UA|українська,es_MX|Español (México),es_ES|Español (España),he_IL|עִברִית,el_GR|Ελληνικά,hu_HU|Magyar,id_ID|Indonesian,vi_VN|Tiếng Việt
title,Hello,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

```

## Features

Generate app_i18n.dart file by app_i18n.csv file.

## Requirements

Translate using [Microsoft Translator Text](https://rapidapi.com/microsoft-azure-org-microsoft-cognitive-services/api/microsoft-translator-text/) by Rapid Api.

So you need to have an API Key from [https://rapidapi.com](https://rapidapi.com)

`Flutter i18n generate iOS i18n` command need setup iOS project native i18n first.

## Extension Settings

Include if your extension adds any VS Code settings through the `fluttergeti18ngenerator.enableordisablefluttergeti18ngenerator` extension point.

* `Flutter Enable/Disable app_i18n.csv Generator`
* `Flutter Enable/Disable app_i18n.csv Translate`
* `Flutter Set Microsoft Translate Rapid Api Key`
* `Flutter i18n generate iOS i18n`

## For developer
[publish](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Known Issues

None

## Release Notes

### [0.1.0] - 2023-9-9

Add app_i18n.csv key column [ignore] tag for translate function.

---

### [0.0.10] - 2023-9-4

Add iOS native i18n sync function.

---

### [0.0.9] - 2023-9-4

Fix app_i18n.dart zh-Hant and zh-Hans error.

---

### 0.0.8

Fix app_i18n.dart getSelectLocale logic error.

---
### 0.0.7

Add Translate function by Rapid's Microsoft Translate api.

---

### 0.0.6

Add `List<Locale> supportedLocales` function.

---

### 0.0.1

Init

---