import * as assert from 'assert';
import { generateDartFile } from '../../generator';
import type { CsvTable } from '../../types';

suite('Generator Test Suite', () => {
	test('generateDartFile escapes Dart string content and strips header tags', () => {
		const csvTable: CsvTable = [
			['key', 'en_US|English(US)[base]', 'zh_TW|繁體中文'],
			['title', 'It\'s $5\\path\nline', '標題'],
			['welcome[key]', 'Hello', '你好'],
		];

		const result = generateDartFile(csvTable);

		assert.ok(result.includes('\'en_US\': \'English(US)\','));
		assert.ok(result.includes('\'title\': \'It\\\'s \\$5\\\\path\\nline\','));
		assert.ok(result.includes('\'welcome\': \'Hello\','));
	});
});
