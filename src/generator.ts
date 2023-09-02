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
    if (Get.locale != null) {\n\
      languageCode = Get.locale!.languageCode;\n\
      countryCode = Get.locale!.countryCode ?? "";\n\
    } else {\n\
      if (Get.deviceLocale != null) {\n\
        languageCode = Get.deviceLocale!.languageCode;\n\
        countryCode = Get.deviceLocale!.countryCode ?? "";\n\
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
	const templateListSupportedLocalesValue = '    const Locale(\'@key\', \'@value\'),\n\
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

		var currentListSupportedLocalesValue = templateListSupportedLocalesValue;
		currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@key', language.split('_')[0]);
		currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@value', language.split('_')[1]);
		currentFile = currentFile.replace("@list_supportedLocales_value", currentListSupportedLocalesValue);
	}
	currentFile = currentFile.replace("\n@list_display_value", "");
	currentFile = currentFile.replace("\n@list_supportedLocales_value", "");
	//TODO: 这个foreach需要改成for循环，这里需要下标了，不是key了
	keys.forEach(element => {
		if(element === 'key') { return; }
		const language = element.split('|')[0];
		var currentLanguage = templateLanguage;
		currentLanguage = currentLanguage.replace("@language", language);
		for (let index = 1; index < content.length; index++) {
			var item = new Map(Object.entries(content[index]));
			var currentKey = item.get('key') as string; // 这里要改，应该直接写0就可以，因为第一列就是key
			var currentValue = item.get(element) as string; // 这里要改，需要写下标了，因为用language key去找已经找不到了
			var currentKeyValue = templateKeyValue;
			currentKeyValue = currentKeyValue.replace("@key", currentKey);
            currentKeyValue = currentKeyValue.replace("@value", currentValue);
            currentLanguage = currentLanguage.replace("@item", currentKeyValue);
		}
		currentLanguage = currentLanguage.replace("@item", "");
		currentFile = currentFile.replace("@list_language", currentLanguage);
	});
	currentFile = currentFile.replace("\n@list_language", "");
	return currentFile;
}