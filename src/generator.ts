import { validateAppI18nCSVContent } from './csv_and_dart_filesystem';
import { CsvRow, CsvTable } from './types';

type LanguageColumn = {
	index: number;
	locale: string;
	displayName: string;
};

function escapeDartString(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll('\'', '\\\'')
		.replaceAll('\r', '\\r')
		.replaceAll('\n', '\\n')
		.replaceAll('\t', '\\t')
		.replaceAll('$', '\\$');
}

function stripTag(value: string): string {
	return value.replace(/\[.*\]/, '');
}

function stripKeyAnnotation(value: string): string {
	return value.split('[')[0];
}

function getLanguageColumns(headerRow: CsvRow): LanguageColumn[] {
	const languageColumns: LanguageColumn[] = [];

	for (let index = 1; index < headerRow.length; index++) {
		const [locale, displayName] = headerRow[index].split('|');
		languageColumns.push({
			index,
			locale,
			displayName: stripTag(displayName),
		});
	}

	return languageColumns;
}

function buildLanguageMap(content: CsvTable, languageColumns: LanguageColumn[]): string {
	const rows = content.slice(1);

	return languageColumns.map((languageColumn) => {
		const translatedRows = rows.map((row) => {
			return `          '${escapeDartString(stripKeyAnnotation(row[0]))}': '${escapeDartString(row[languageColumn.index])}',`;
		}).join('\n');

		return [
			`        '${escapeDartString(languageColumn.locale)}': {`,
			translatedRows,
			'        },',
		].join('\n');
	}).join('\n');
}

function buildDisplayValueMap(languageColumns: LanguageColumn[]): string {
	return languageColumns.map((languageColumn) => {
		return `        '${escapeDartString(languageColumn.locale)}': '${escapeDartString(languageColumn.displayName)}',`;
	}).join('\n');
}

export function generateDartFile(content: CsvTable): string {
	validateAppI18nCSVContent(content);

	const headerRow = content[0];
	const languageColumns = getLanguageColumns(headerRow);
	const languageMap = buildLanguageMap(content, languageColumns);
	const displayValueMap = buildDisplayValueMap(languageColumns);

	return [
		'import \'package:flutter/material.dart\';',
		'import \'package:get/get.dart\';',
		'',
		'class AppI18N extends Translations {',
		'  @override',
		'  Map<String, Map<String, String>> get keys => {',
		languageMap,
		'      };',
		'  Map<String, String> get key2DisplayValue => {',
		displayValueMap,
		'      };',
		'',
		'',
		'  Locale getSelectLocale() {',
		'    var locale = Get.deviceLocale;',
		'    if (locale == null) {',
		'      return Locale(\'en\', \'US\');',
		'    } else {',
		'      if (locale.languageCode == \'zh\') {',
		'        if (locale.scriptCode == \'Hant\') {',
		'          return Locale.fromSubtags(languageCode: \'zh\', scriptCode: \'Hant\');',
		'        } else {',
		'          return Locale.fromSubtags(languageCode: \'zh\', scriptCode: \'Hans\');',
		'        }',
		'      }',
		'      return locale;',
		'    }',
		'  }',
		'}',
		'',
	].join('\n');
}
