import * as assert from 'assert';
import { generateDartFile } from '../../generator';
import type { CsvTable } from '../../types';

suite('Generator Test Suite', () => {
	test('generateDartFile escapes Dart string content and preserves header display names', () => {
		const csvTable: CsvTable = [
			['key', 'en_US|English(US)', 'zh_TW|繁體中文'],
			['title', 'It\'s $5\\path\nline', '標題'],
			['welcome[key]', 'Hello', '你好'],
		];

		const result = generateDartFile(csvTable);

		assert.ok(result.includes('\'en_US\': \'English(US)\','));
		assert.ok(result.includes('\'title\': \'It\\\'s \\$5\\\\path\\nline\','));
		assert.ok(result.includes('\'welcome\': \'Hello\','));
		assert.ok(result.includes('Map<String, Map<String, String>> get keys {'));
		assert.ok(result.includes('final keys = {'));
		assert.ok(result.includes('return keys;'));
	});

	test('generateDartFile adds Chinese locale aliases when script locales exist', () => {
		const csvTable: CsvTable = [
			['key', 'en|English', 'zh_Hans|简体中文', 'zh_Hant|繁體中文'],
			['title', 'Title', '标题', '標題'],
		];

		const result = generateDartFile(csvTable);

		assert.ok(result.includes('keys[\'zh_CN\'] = keys[\'zh_Hans\']!;'));
		assert.ok(result.includes('keys[\'zh_TW\'] = keys[\'zh_Hant\']!;'));
	});
});
