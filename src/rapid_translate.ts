import * as vscode from 'vscode';
import csv = require('csv');
import { Translate, ToLanguage } from './api';
import { streamToString } from './csv_and_dart_filesystem';

export async function translateCSVFile(content: object[], filename: string, apiKey: string) {
	const keys = content[0] as string[];
	var baseIndex = 0;
	var translateLanguageIndexes: number[] = [];
	var baseLanguageCode = "";
	for (let index = 0; index < keys.length; index++) {
		if (keys[index] === 'key') {continue;}
		const language = keys[index].split('|')[0];
		var name = keys[index].split('|')[1];
		if (name.endsWith("]")) {
			if (name.endsWith("[base]")) {
				baseIndex = index;
				baseLanguageCode = language.replace('_', '-');
			}
		} else {
			translateLanguageIndexes.push(index);
		}
	}
	let translate = new Translate(apiKey, baseLanguageCode);
	for (let rowIndex = 1; rowIndex < content.length; rowIndex++) {
		var items = content[rowIndex] as Array<string>;
		var sourceValue = items[baseIndex];
		var toLanguages : ToLanguage[] = [];
		for(let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
			if (translateLanguageIndexes.includes(columnIndex)) {
				var toLanguage = new ToLanguage(keys[columnIndex].split('|')[0].replace('_', '-'), columnIndex);
				toLanguages.push(toLanguage);
			}
		}
		translate.addTranslateRequest(toLanguages, sourceValue, rowIndex);
	}
	let values = await translate.request();
	values.forEach((translateParam) => {
		const rowIndex = translateParam.rowIndex;
		translateParam.toLanguages.forEach((toLanguage) => {
			const columnIndex = toLanguage.columnIndex;
			var items = content[rowIndex] as Array<string>;
			items[columnIndex] = toLanguage.value;
		});
	});
	const transformer = csv.transform(function(data: Uint8Array){
		return data;
	});
	const stringifier = csv.stringify({
		delimiter: ','
	});
	content.forEach((element) => {
		stringifier.write(element);
	});
	stringifier.pipe(transformer);
	stringifier.end();
	const result = await streamToString(transformer);
	await vscode.workspace.fs.writeFile(vscode.Uri.parse(filename), new TextEncoder().encode(result));
}
