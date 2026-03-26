import { validateAppI18nCSVContent } from './csv_and_dart_filesystem';
import { CsvRow, CsvTable } from './types';

function escapeDartString(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll('\'', '\\\'')
		.replaceAll('\r', '\\r')
		.replaceAll('\n', '\\n')
		.replaceAll('\t', '\\t')
		.replaceAll('$', '\\$');
}

export function generateDartFile(content: CsvTable): string{
	validateAppI18nCSVContent(content);
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
    var locale = Get.deviceLocale;\n\
    if (locale == null) {\n\
      return Locale(\'en\', \'US\');\n\
    } else {\n\
      if (locale.languageCode == \'zh\') {\n\
        if (locale.scriptCode == \'Hant\') {\n\
          return Locale.fromSubtags(languageCode: \'zh\', scriptCode: \'Hant\');\n\
        } else {\n\
          return Locale.fromSubtags(languageCode: \'zh\', scriptCode: \'Hans\');\n\
        }\n\
      }\n\
      return locale;\n\
    }\n\
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
		currentDisplayValue = currentDisplayValue.replace('@key', escapeDartString(language));
		currentDisplayValue = currentDisplayValue.replace('@value', escapeDartString(name));
		currentFile = currentFile.replace("@list_display_value", currentDisplayValue);
	}
	currentFile = currentFile.replace("\n@list_display_value", "");
	for( let columnIndex = 0; columnIndex < keys.length ; columnIndex++ ) {
		if(keys[columnIndex] === 'key') { continue; }
		const language = keys[columnIndex].split('|')[0];
		var currentLanguage = templateLanguage;
		currentLanguage = currentLanguage.replace("@language", escapeDartString(language));
		for (let rowIndex = 1; rowIndex < content.length; rowIndex++) {
			const item: CsvRow = content[rowIndex];
			var currentKey = item[0];
			currentKey = currentKey.split('[')[0];
			var currentValue = item[columnIndex];
			var currentKeyValue = templateKeyValue;
			currentKeyValue = currentKeyValue.replace("@key", escapeDartString(currentKey));
            currentKeyValue = currentKeyValue.replace("@value", escapeDartString(currentValue));
            currentLanguage = currentLanguage.replace("@item", currentKeyValue);
		}
		currentLanguage = currentLanguage.replace("@item", "");
		currentFile = currentFile.replace("@list_language", currentLanguage);
	}
	currentFile = currentFile.replace("\n@list_language", "");
	return currentFile;
}
