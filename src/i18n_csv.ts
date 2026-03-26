import type { CsvRow, CsvTable } from './types';

export type LanguageColumn = {
	index: number;
	locale: string;
	displayName: string;
};

export type LanguageColumnMatch = {
	columnIndex: number;
	csvLocale: string;
	strategy: 'exact' | 'language' | 'region';
};

export function stripHeaderTag(value: string): string {
	return value.replace(/\[.*\]/, '');
}

export function stripKeyAnnotation(value: string): string {
	return value.split('[')[0];
}

export function getLanguageColumns(headerRow: CsvRow): LanguageColumn[] {
	const languageColumns: LanguageColumn[] = [];

	for (let index = 1; index < headerRow.length; index++) {
		const [locale, displayName] = headerRow[index].split('|');
		languageColumns.push({
			index,
			locale,
			displayName: stripHeaderTag(displayName),
		});
	}

	return languageColumns;
}

export function findTitleRowIndex(content: CsvTable): number {
	return content.findIndex((row) => stripKeyAnnotation(row[0]) === 'title');
}

export function normalizeLocale(locale: string): string {
	return locale.replace('_', '-').toLowerCase();
}

export function getLanguageCode(locale: string): string {
	return normalizeLocale(locale).split('-')[0];
}

function getCsvLocale(header: string): string {
	return header.split('|')[0];
}

export function findLanguageColumnMatch(localeName: string, keys: CsvRow): LanguageColumnMatch | undefined {
	const normalizedLocaleName = normalizeLocale(localeName);
	const localeLanguageCode = getLanguageCode(localeName);

	for (let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
		const csvLocale = getCsvLocale(keys[columnIndex]);
		if (normalizedLocaleName === normalizeLocale(csvLocale)) {
			return { columnIndex, csvLocale, strategy: 'exact' };
		}
	}

	for (let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
		const csvLocale = getCsvLocale(keys[columnIndex]);
		if (normalizedLocaleName === getLanguageCode(csvLocale)) {
			return { columnIndex, csvLocale, strategy: 'language' };
		}
	}

	for (let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
		const csvLocale = getCsvLocale(keys[columnIndex]);
		if (localeLanguageCode === getLanguageCode(csvLocale)) {
			return { columnIndex, csvLocale, strategy: 'region' };
		}
	}

	return undefined;
}
