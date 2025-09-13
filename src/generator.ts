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
\n\
  Locale getSelectLocale() {\n\
    String languageCode = \'en\';\n\
    String countryCode = \'undefined\';\n\
    if (Get.deviceLocale != null) {\n\
      languageCode = Get.deviceLocale!.languageCode;\n\
      if (languageCode == \'zh\') {\n\
        if (Get.deviceLocale!.scriptCode? == \'Hant\') {\n\
          countryCode = \'TW\';\n\
        } else {\n\
          countryCode = \'CN\';\n\
        }\n\
      }\n\
    }\n\
    for (var item in AppI18N().key2DisplayValue.keys) {\n\
      if (countryCode == \'undefined\') {\n\
        if (item.startsWith(languageCode)) {\n\
          return Locale(languageCode);\n\
        }\n\
      } else {\n\
        if (item.endsWith(countryCode)) {\n\
          return Locale(languageCode, countryCode);\n\
        }\n\
      }\n\
    }\n\
    return Locale(languageCode);\n\
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
	}
	currentFile = currentFile.replace("\n@list_display_value", "");
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