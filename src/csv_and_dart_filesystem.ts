import csv = require('csv');
import * as vscode from 'vscode';

const utf8Decoder = new TextDecoder('utf-8');
const languageHeaderPattern = /^[^|]+\|.+(?:\[[^\]]+\])?$/;

type AppI18nValidationOptions = {
	requireTitleRow?: boolean;
};

export async function readUtf8File(fileUri: vscode.Uri): Promise<string> {
	return utf8Decoder.decode(await vscode.workspace.fs.readFile(fileUri));
}

export function validateAppI18nCSVContent(content: object[], options: AppI18nValidationOptions = {}): void {
	if (content.length === 0) {
		throw new Error('app_i18n.csv is empty.');
	}

	const headerRow = content[0];
	if (!Array.isArray(headerRow) || headerRow.length === 0) {
		throw new Error('app_i18n.csv header row is missing.');
	}
	if (headerRow[0] !== 'key') {
		throw new Error('app_i18n.csv must start with a key column.');
	}
	if (headerRow.length < 2) {
		throw new Error('app_i18n.csv must include at least one language column.');
	}

	for (let columnIndex = 1; columnIndex < headerRow.length; columnIndex++) {
		const header = headerRow[columnIndex];
		if (typeof header !== 'string' || !languageHeaderPattern.test(header)) {
			throw new Error(`Invalid language header at column ${columnIndex + 1}.`);
		}
		const [locale, displayNameWithTag] = header.split('|');
		const displayName = displayNameWithTag.replace(/\[[^\]]+\]$/, '').trim();
		if (locale.trim() === '' || displayName === '') {
			throw new Error(`Invalid language header at column ${columnIndex + 1}.`);
		}
	}

	let hasTitleRow = false;
	for (let rowIndex = 1; rowIndex < content.length; rowIndex++) {
		const row = content[rowIndex];
		if (!Array.isArray(row) || row.length === 0) {
			throw new Error(`Row ${rowIndex + 1} is empty.`);
		}
		if (typeof row[0] !== 'string' || row[0].trim() === '') {
			throw new Error(`Row ${rowIndex + 1} is missing a key value.`);
		}
		if (row.length < headerRow.length) {
			throw new Error(`Row ${rowIndex + 1} has fewer columns than the header row.`);
		}
		if (row[0].split('[')[0] === 'title') {
			hasTitleRow = true;
		}
	}

	if (options.requireTitleRow && !hasTitleRow) {
		throw new Error('app_i18n.csv must include a title row.');
	}
}

export async function readAppi18nCSVFile(csvFile: vscode.Uri): Promise<object[]>{
	var contents = await readUtf8File(csvFile);
	const p = new Promise<object[]>(async (resolve, reject) => {
		csv.parse(contents, { delimiter: "," }, (error, values) => {
			if (error) {
				reject(error);
				return;
			}
			try {
				validateAppI18nCSVContent(values);
				resolve(values);
			} catch (validationError) {
				reject(validationError);
			}
		});
	});
	return p;
}

export async function saveDartFile(fileUri: vscode.Uri, content: string) {
	await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(content));
}

export function streamToString(stream: NodeJS.WritableStream) : Promise<string>{
	let chunks: Uint8Array[] = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}
