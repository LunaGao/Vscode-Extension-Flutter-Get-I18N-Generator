import * as assert from 'assert';
import { findLanguageColumnMatch, findTitleRowIndex } from '../../i18n_csv';
import type { CsvRow, CsvTable } from '../../types';

suite('I18N CSV Test Suite', () => {
	test('findTitleRowIndex finds the title row', () => {
		const csvTable: CsvTable = [
			['key', 'en_US|English(US)'],
			['welcome', 'Hello'],
			['title', 'App Name'],
		];

		assert.strictEqual(findTitleRowIndex(csvTable), 2);
	});

	test('findLanguageColumnMatch supports exact, language, and region matching', () => {
		const headerRow: CsvRow = [
			'key',
			'en_US|English(US)',
			'pt_BR|Português (Brasil)',
			'zh_TW|繁體中文',
		];

		assert.deepStrictEqual(findLanguageColumnMatch('pt-BR', headerRow), {
			columnIndex: 2,
			csvLocale: 'pt_BR',
			strategy: 'exact',
		});
		assert.deepStrictEqual(findLanguageColumnMatch('zh', headerRow), {
			columnIndex: 3,
			csvLocale: 'zh_TW',
			strategy: 'language',
		});
		assert.deepStrictEqual(findLanguageColumnMatch('en-GB', headerRow), {
			columnIndex: 1,
			csvLocale: 'en_US',
			strategy: 'region',
		});
	});
});
