export function generateDartFile(content: object[]): string{
	const templateFile = 'import \'package:flutter/material.dart\';\n\
import \'package:get/get.dart\';\n\n\
class AppI18N extends Translations \{\n\
  @override\n\
  Map<String, Map<String, String>> get keys => \{\n\
@list_language\n\
      };\n\
  Map<String, String> get key2DisplayValue => {\n\
@list_display_value\n\
      };\n\
\n\
  List<Locale> supportedLocales = \[\n\
@list_supportedLocales_value\n\
  ];\n\
\n\
  Locale getSelectLocale() {\n\
    String languageCode = \'\';\n\
    String countryCode = \'\';\n\
	if (Get.deviceLocale != null) {\n\
		languageCode = Get.deviceLocale!.languageCode;\n\
		countryCode = Get.deviceLocale!.countryCode ?? "";\n\
		if (languageCode == \'zh\') {\n\
			countryCode = Get.deviceLocale!.scriptCode!;\n\
		}\n\
	} else {\n\
		if (Get.locale != null) {\n\
			languageCode = Get.locale!.languageCode;\n\
			countryCode = Get.locale!.countryCode ?? "";\n\
		} else {\n\
			languageCode = \'en\';\n\
			countryCode = \'US\';\n\
		}\n\
	}\n\
    if (AppI18N()\n\
        .key2DisplayValue\n\
        .keys\n\
        .contains(\'${languageCode}_$countryCode\')) {\n\
      return Locale(languageCode, countryCode);\n\
    }\n\
    for (var item in AppI18N().key2DisplayValue.keys) {\n\
      if (item.split(\'_\')[0] == languageCode) {\n\
        return Locale(languageCode, item.split(\'_\')[1]);\n\
      }\n\
    }\n\
    return const Locale(\'en\', \'US\');\n\
  }\n\
}\n\
';
	const templateLanguage = '        \'@language\': {\n\
	@item\
			},\n\
@list_language';
	const templateKeyValue = '        \'@key\': \'@value\',\n\
	@item';
	const templateDisplayValue = '        \'@key\': \'@value\',\n\
@list_display_value';
	const templateListSupportedLocalesValueOne = '    const Locale(\'@key\'),\n\
@list_supportedLocales_value';
	const templateListSupportedLocalesValueTwo = '    const Locale(\'@key\', \'@value\'),\n\
@list_supportedLocales_value';

	var currentFile = templateFile;
	const keys = content[0] as string[];
	for (let index = 0; index < keys.length; index++) {
		if (keys[index] === 'key') {continue;}
		const language = keys[index].split('|')[0];
		var name = keys[index].split('|')[1];
		name = name.replace(/\[.*\]/, "");
		var currentDisplayValue = templateDisplayValue;
		currentDisplayValue = currentDisplayValue.replace('@key', language);
		currentDisplayValue = currentDisplayValue.replace('@value', name);
		currentFile = currentFile.replace("@list_display_value", currentDisplayValue);
		var currentListSupportedLocalesValue = '';
		if (language.split('_').length >= 2) {
			currentListSupportedLocalesValue = templateListSupportedLocalesValueTwo;
			currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@key', language.split('_')[0]);
			currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@value', language.split('_')[1]);
		} else {
			currentListSupportedLocalesValue = templateListSupportedLocalesValueOne;
			currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@key', language);
		}
		
		currentFile = currentFile.replace("@list_supportedLocales_value", currentListSupportedLocalesValue);
	}
	currentFile = currentFile.replace("\n@list_display_value", "");
	currentFile = currentFile.replace("\n@list_supportedLocales_value", "");
	for( let columnIndex = 0; columnIndex < keys.length ; columnIndex++ ) {
		if(keys[columnIndex] === 'key') { continue; }
		const language = keys[columnIndex].split('|')[0];
		var currentLanguage = templateLanguage;
		currentLanguage = currentLanguage.replace("@language", language);
		for (let rowIndex = 1; rowIndex < content.length; rowIndex++) {
			var item = content[rowIndex] as Array<string>;
			var currentKey = item[0] as string;
			currentKey = currentKey.split('[')[0];
			var currentValue = item[columnIndex] as string;
			var currentKeyValue = templateKeyValue;
			currentValue = currentValue.replaceAll("'", "\\'");
			currentKeyValue = currentKeyValue.replace("@key", currentKey);
            currentKeyValue = currentKeyValue.replace("@value", currentValue);
            currentLanguage = currentLanguage.replace("@item", currentKeyValue);
		}
		currentLanguage = currentLanguage.replace("@item", "");
		currentFile = currentFile.replace("@list_language", currentLanguage);
	}
	currentFile = currentFile.replace("\n@list_language", "");
	return currentFile;
}