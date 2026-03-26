import * as assert from 'assert';
import { updateCFBundleDisplayName } from '../../ios/ios_strings';

suite('iOS Strings Test Suite', () => {
	test('updateCFBundleDisplayName updates and escapes the target line', () => {
		const content = [
			'"CFBundleName" = "Runner";',
			'"CFBundleDisplayName" = "Old Name";',
		].join('\r\n');

		const result = updateCFBundleDisplayName(content, 'App "Name"\\Path');

		assert.ok(result.includes('"CFBundleDisplayName" = "App \\"Name\\"\\\\Path";'));
		assert.ok(result.includes('\r\n'));
	});
});
