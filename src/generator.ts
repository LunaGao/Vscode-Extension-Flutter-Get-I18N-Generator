import { validateAppI18nCSVContent } from './csv_and_dart_filesystem';
import { getLanguageColumns, stripKeyAnnotation } from './i18n_csv';
import type { CsvTable } from './types';

function escapeDartString(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll('\'', '\\\'')
		.replaceAll('\r', '\\r')
		.replaceAll('\n', '\\n')
		.replaceAll('\t', '\\t')
		.replaceAll('$', '\\$');
}

function buildLanguageMap(content: CsvTable, languageColumns: ReturnType<typeof getLanguageColumns>): string {
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

function buildDisplayValueMap(languageColumns: ReturnType<typeof getLanguageColumns>): string {
	return languageColumns.map((languageColumn) => {
		return `        '${escapeDartString(languageColumn.locale)}': '${escapeDartString(languageColumn.displayName)}',`;
	}).join('\n');
}

function buildLanguageAliasAssignments(languageColumns: ReturnType<typeof getLanguageColumns>): string[] {
	const aliases: string[] = [];
	const locales = new Set(languageColumns.map((languageColumn) => languageColumn.locale));

	if (locales.has('zh_Hans')) {
		aliases.push('    keys[\'zh_CN\'] = keys[\'zh_Hans\']!;');
	}
	if (locales.has('zh_Hant')) {
		aliases.push('    keys[\'zh_TW\'] = keys[\'zh_Hant\']!;');
	}

	return aliases;
}

export function generateDartFile(content: CsvTable): string {
	validateAppI18nCSVContent(content);

	const headerRow = content[0];
	const languageColumns = getLanguageColumns(headerRow);
	const languageMap = buildLanguageMap(content, languageColumns);
	const displayValueMap = buildDisplayValueMap(languageColumns);
	const languageAliases = buildLanguageAliasAssignments(languageColumns);

	return [
		'// GENERATED CODE - DO NOT MODIFY BY HAND',
		'',
		'import \'package:flutter/material.dart\';',
		'import \'package:get/get.dart\';',
		'',
		'class AppI18N extends Translations {',
		'  @override',
		'  Map<String, Map<String, String>> get keys {',
		'    final keys = {',
		languageMap,
		'    };',
		...languageAliases,
		'    return keys;',
		'  }',
		'  Map<String, String> get key2DisplayValue => {',
		displayValueMap,
		'      };',
		'',
		'',
		'  Locale getSelectLocale() {',
		'    var locale = Get.deviceLocale;',
		'    if (locale == null) {',
		'      return const Locale(\'en\');',
		'    } else {',
		'      if (locale.languageCode == \'en\') {',
		'        return const Locale(\'en\');',
		'      }',
		'      if (locale.languageCode == \'zh\') {',
		'        if (locale.scriptCode == \'Hant\' ||',
		'            locale.countryCode == \'TW\' ||',
		'            locale.countryCode == \'HK\' ||',
		'            locale.countryCode == \'MO\') {',
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
