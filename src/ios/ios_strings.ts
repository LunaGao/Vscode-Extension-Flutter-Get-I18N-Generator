export function escapeInfoPlistStringValue(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll('"', '\\"');
}

export function updateCFBundleDisplayName(stringsContent: string, value: string): string {
	const lineBreak = stringsContent.includes('\r\n') ? '\r\n' : '\n';
	const lines = stringsContent.split(/\r?\n/);
	const targetLineIndex = lines.findIndex((line) => line.includes('"CFBundleDisplayName"'));

	if (targetLineIndex < 0) {
		throw new Error('CFBundleDisplayName can not matched.');
	}

	const lineMatch = lines[targetLineIndex].match(/^(\s*"CFBundleDisplayName"\s*=\s*")([^"]*)(";.*)$/);
	if (lineMatch === null) {
		throw new Error('CFBundleDisplayName line format is invalid.');
	}

	lines[targetLineIndex] = `${lineMatch[1]}${escapeInfoPlistStringValue(value)}${lineMatch[3]}`;
	return lines.join(lineBreak);
}
