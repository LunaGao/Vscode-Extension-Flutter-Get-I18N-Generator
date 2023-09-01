import * as vscode from 'vscode';
import csv = require('csv');
import fs = require('fs');
import csvParser = require('csv-parser');
const axios = require('axios');

export function activate(context: vscode.ExtensionContext) {

	let enableDartGenerator = vscode.commands.registerCommand('fluttergeti18ngenerator.enableordisablefluttergeti18ngenerator', async () => {
		if (vscode.workspace.workspaceFolders) {
			const value = await vscode.window.showQuickPick(['Enable', 'Disable'], { placeHolder: 'Select the flutter app_i18n.dart generate enable or disable.' });			
			if (value) {
				var saveValue = value === 'Enable' ? true : false;
				await vscode.workspace.getConfiguration().update('conf.flutter.i18ncsv.enable', saveValue, vscode.ConfigurationTarget.Workspace);
				if (saveValue) {
					vscode.window.showInformationMessage('Enable app_i18n.dart auto generate!');
				} else {
					vscode.window.showInformationMessage('Disable app_i18n.dart auto generate!');
				}
			}
		}
	});

	let enableCSVTranslate = vscode.commands.registerCommand('fluttergeti18ngenerator.enableordisablefluttergeti18ngeneratortranslate', async () => {
		if (vscode.workspace.workspaceFolders) {
			const value = await vscode.window.showQuickPick(['Enable', 'Disable'], { placeHolder: 'Select the flutter app_i18n.csv translate enable or disable.' });			
			if (value) {
				var saveValue = value === 'Enable' ? true : false;
				await vscode.workspace.getConfiguration().update('conf.flutter.i18ncsv.translate', saveValue, vscode.ConfigurationTarget.Workspace);
				if (saveValue) {
					vscode.window.showInformationMessage('Enable app_i18n.csv auto translate!');
				} else {
					vscode.window.showInformationMessage('Disable app_i18n.csv auto translate!');
				}
			}
		}
	});

    let enableDartGeneratorCSV = vscode.workspace.onDidSaveTextDocument(async (document) => {
		if (document.fileName.endsWith('app_i18n.csv')) {
			const enableTranslate = vscode.workspace.getConfiguration().get('conf.flutter.i18ncsv.translate', false);
			const enableGenerate = vscode.workspace.getConfiguration().get('conf.flutter.i18ncsv.enable', false);
			if (enableTranslate || enableGenerate) {
				const options = {
					location: vscode.ProgressLocation.Notification,
					title: "Flutter i18n Generator",
					cancellable: false,
				};
				vscode.window.withProgress(options, async (progress, token) => {
					var value : object[];
					try {
						value = await readAppi18nCSVFile(document.fileName);
					} catch (ex){
						vscode.window.showErrorMessage("Read app_i18n.csv file error!");
						return new Promise<void>(resolve => {resolve();});
					}
					if (enableTranslate) {
						progress.report({message: "Translating app_i18n.csv file..."});
						try {
							await translateCSVFile(value, document.fileName);
						} catch (ex){
							vscode.window.showErrorMessage("Failed translate app_i18n.csv file!");
							return new Promise<void>(resolve => {resolve();});
						}
						
					}
					// if (enableGenerate) {
					// 	const dartPath = document.fileName.substring(0, document.fileName.length - 3) + 'dart';
					// 	const dartFileUri = vscode.Uri.parse(dartPath);
					// 	progress.report({message: "Reading csv file..."});
					// 	var value : object[];
					// 	try {
					// 		value = await readAppi18nCSVFile(document.fileName);
					// 	} catch (ex){
					// 		vscode.window.showErrorMessage("Read app_i18n.csv file error!");
					// 		return new Promise<void>(resolve => {resolve();});
					// 	}
					// 	progress.report({message: "Generating dart file..."});
					// 	var content = generateDartFile(value);
					// 	progress.report({message: "Saving dart file..."});
					// 	await saveDartFile(dartFileUri, content);
					// }
					return new Promise<void>(resolve => {resolve();});
				});
			}
		}
    });

	context.subscriptions.push(enableDartGenerator);
	context.subscriptions.push(enableCSVTranslate);
	context.subscriptions.push(enableDartGeneratorCSV);
}

export function deactivate() {}

async function readAppi18nCSVFile(csvFile: string): Promise<object[]>{
	const results: object[] = [];
	const p = new Promise<object[]>(async (resolve, reject) => {
		fs.createReadStream(csvFile).pipe(csv.parse({ delimiter: "," }))
			.on('headers', (headers) => results.push(headers))
			.on('data', (data) => results.push(data))
			.on('end', () => resolve(results))
			.on('error', (error) => reject(error));
	});
	return p;
}

async function readAppi18nCSVFile_OLD(csvFile: string): Promise<object[]>{
	const results: object[] = [];
	const p = new Promise<object[]>(async (resolve, reject) => {
		fs.createReadStream(csvFile).pipe(csvParser())
			.on('headers', (headers) => results.push(headers))
			.on('data', (data) => results.push(data))
			.on('end', () => resolve(results))
			.on('error', (error) => reject(error));
	});
	return p;
}

async function saveDartFile(fileUri: vscode.Uri, content: string) {
	await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(content));
}

async function translateCSVFile(content: object[], filename: string) {
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
		var translateValues = await getRequest(baseLanguageCode, toLanguages, sourceValue);
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

function streamToString(stream: NodeJS.WritableStream) : Promise<string>{
	let chunks: Uint8Array[] = [];
	return new Promise((resolve, reject) => {
	  stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
	  stream.on('error', (err) => reject(err));
	  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}

async function getRequest(fromLanguage: String, toLanguage: string[], value: String) {
	let paramsContent = {
		'api-version': '3.0',
		from: fromLanguage,
		profanityAction: 'NoAction',
		textType: 'plain'
	};
	for(let toLanguageIndex = 0; toLanguageIndex < toLanguage.length; toLanguageIndex++) {
		paramsContent = Object.defineProperty(paramsContent, 'to[' + toLanguageIndex + ']', {
				value: toLanguage[toLanguageIndex], writable : true,
				enumerable : true,
				configurable : true}
			);
	}
	var options = {
		method: 'POST',
		url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
		params: paramsContent,
		headers: {
			'Accept-Encoding': 'compress, deflate, br',
			'content-type': 'application/json',
			'X-RapidAPI-Key': 'c4816bb564mshda269e5d122c28cp17d325jsn488500fb2131',
			'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
		},
		data: [
			{
				Text: value
			}
		]
	};

	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return error;
	}
}


function generateDartFile(content: object[]): string{
	const templateFile = 'import \'package:flutter/material.dart\';\n\
import \'package:get/get.dart\';\n\n\
class AppI18N extends Translations \{\n\
  @override\n\
  Map<String, Map<String, String>> get keys => \{\n\
@list_language\n\
      };\n\
  Map<String, String> get key2DisplayValue => {\n\
@list_display_value\n\
      };\n\
\n\
  List<Locale> supportedLocales = \[\n\
@list_supportedLocales_value\n\
  ];\n\
\n\
  Locale getSelectLocale() {\n\
    String languageCode = \'\';\n\
    String countryCode = \'\';\n\
    if (Get.locale != null) {\n\
      languageCode = Get.locale!.languageCode;\n\
      countryCode = Get.locale!.countryCode ?? "";\n\
    } else {\n\
      if (Get.deviceLocale != null) {\n\
        languageCode = Get.deviceLocale!.languageCode;\n\
        countryCode = Get.deviceLocale!.countryCode ?? "";\n\
      } else {\n\
        languageCode = \'en\';\n\
        countryCode = \'US\';\n\
      }\n\
    }\n\
    if (AppI18N()\n\
        .key2DisplayValue\n\
        .keys\n\
        .contains(\'${languageCode}_$countryCode\')) {\n\
      return Locale(languageCode, countryCode);\n\
    }\n\
    for (var item in AppI18N().key2DisplayValue.keys) {\n\
      if (item.split(\'_\')[0] == languageCode) {\n\
        return Locale(languageCode, item.split(\'_\')[1]);\n\
      }\n\
    }\n\
    return const Locale(\'en\', \'US\');\n\
  }\n\
}\n\
';
	const templateLanguage = '        \'@language\': {\n\
	@item\
			},\n\
@list_language';
	const templateKeyValue = '        \'@key\': \'@value\',\n\
	@item';
	const templateDisplayValue = '        \'@key\': \'@value\',\n\
@list_display_value';
	const templateListSupportedLocalesValue = '    const Locale(\'@key\', \'@value\'),\n\
@list_supportedLocales_value';

	var currentFile = templateFile;
	const keys = content[0] as string[];
	for (let index = 0; index < keys.length; index++) {
		if (keys[index] === 'key') {continue;}
		const language = keys[index].split('|')[0];
		var name = keys[index].split('|')[1];
		name = name.replace(/\[.*\]/, "");
		var currentDisplayValue = templateDisplayValue;
		currentDisplayValue = currentDisplayValue.replace('@key', language);
		currentDisplayValue = currentDisplayValue.replace('@value', name);
		currentFile = currentFile.replace("@list_display_value", currentDisplayValue);

		var currentListSupportedLocalesValue = templateListSupportedLocalesValue;
		currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@key', language.split('_')[0]);
		currentListSupportedLocalesValue = currentListSupportedLocalesValue.replace('@value', language.split('_')[1]);
		currentFile = currentFile.replace("@list_supportedLocales_value", currentListSupportedLocalesValue);
	}
	currentFile = currentFile.replace("\n@list_display_value", "");
	currentFile = currentFile.replace("\n@list_supportedLocales_value", "");
	keys.forEach(element => {
		if(element === 'key') { return; }
		const language = element.split('|')[0];
		var currentLanguage = templateLanguage;
		currentLanguage = currentLanguage.replace("@language", language);
		for (let index = 1; index < content.length; index++) {
			var item = new Map(Object.entries(content[index]));
			var currentKey = item.get('key') as string;
			var currentValue = item.get(element) as string;
			var currentKeyValue = templateKeyValue;
			currentKeyValue = currentKeyValue.replace("@key", currentKey);
            currentKeyValue = currentKeyValue.replace("@value", currentValue);
            currentLanguage = currentLanguage.replace("@item", currentKeyValue);
		}
		currentLanguage = currentLanguage.replace("@item", "");
		currentFile = currentFile.replace("@list_language", currentLanguage);
	});
	currentFile = currentFile.replace("\n@list_language", "");
	return currentFile;
}