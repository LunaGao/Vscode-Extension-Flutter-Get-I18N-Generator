import * as vscode from 'vscode';
import fs = require('fs');
import csvParser = require('csv-parser');

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('fluttergeti18ngenerator.enableordisablefluttergeti18ngenerator', async () => {
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

    let disposableCSV = vscode.workspace.onDidSaveTextDocument(async (document) => {
		const enableGenerate = vscode.workspace.getConfiguration().get('conf.flutter.i18ncsv.enable', false);
		if (enableGenerate) {
			if (document.fileName.endsWith('app_i18n.csv')) {
				const dartPath = document.fileName.substring(0, document.fileName.length - 3) + 'dart';
				const dartFileUri = vscode.Uri.parse(dartPath);
				const options = {
					location: vscode.ProgressLocation.Notification,
					title: "Generate app_i18n.dart file",
					cancellable: false,
				};
				vscode.window.withProgress(options, async (progress, token) => {
					progress.report({message: "Reading csv file..."});
					var value : object[];
					try {
						value = await readAppi18nCSVFile(document.fileName);
					} catch (ex){
						vscode.window.showErrorMessage("Read app_i18n.csv file error!");
						return new Promise<void>(resolve => {resolve();});
					}
					progress.report({message: "Generate dart file..."});
					var content = generateDartFile(value);
					progress.report({message: "Save dart file..."});
					await saveDartFile(dartFileUri, content);
					return new Promise<void>(resolve => {resolve();});
				});
			}
		}
    });

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableCSV);
}

export function deactivate() {}

async function readAppi18nCSVFile(csvFile: string): Promise<object[]>{
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
    } else {\n\
      return const Locale(\'en\', \'US\');\n\
    }\n\
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

	var currentFile = templateFile;
	const keys = content[0] as string[];
	for (let index = 0; index < keys.length; index++) {
		if (keys[index] === 'key') {continue;}
		const language = keys[index].split('|')[0];
		const name = keys[index].split('|')[1];
		var currentDisplayValue = templateDisplayValue;
		currentDisplayValue = currentDisplayValue.replace('@key', language);
		currentDisplayValue = currentDisplayValue.replace('@value', name);
		currentFile = currentFile.replace("@list_display_value", currentDisplayValue);
	}
	currentFile = currentFile.replace("\n@list_display_value", "");
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