import * as vscode from 'vscode';
import csv = require('csv');

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
	const transformer = csv.transform(function(data: Uint8Array){
		return data;
	});
	const stringifier = csv.stringify({
		delimiter: ',', header: true, columns: keys, 
	});
	for (let index = 1; index < content.length; index++) {
		var items = content[index] as Array<string>;
		var sourceValue = items[baseIndex];
		var toLanguages = [];
		for(let languageIndex = 1; languageIndex < keys.length; languageIndex++) {
			if (translateLanguageIndexes.includes(languageIndex)) {
				toLanguages.push(keys[languageIndex].split('|')[0].replace('_', '-'));
			}
		}
		var translateValues = await translateFromRapidMicrosoftApi(baseLanguageCode, toLanguages, sourceValue, apiKey);
		for (let toLanguageIndex = 0; toLanguageIndex < translateLanguageIndexes.length; toLanguageIndex++) {
			items[translateLanguageIndexes[toLanguageIndex]] = translateValues[0].translations[toLanguageIndex].text;
			content[index] = items;
		}
		stringifier.write(content[index]);
		console.log(translateValues);
	}
	stringifier.pipe(transformer);
	stringifier.end();
	const result = await streamToString(transformer);
	await vscode.workspace.fs.writeFile(vscode.Uri.parse(filename + "a"), new TextEncoder().encode(result));
}
