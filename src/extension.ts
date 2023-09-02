import * as vscode from 'vscode';
import { generateDartFile } from './generator';
import { readAppi18nCSVFile, saveDartFile } from './csv_and_dart_filesystem';
import { translateCSVFile } from './rapid_translate';

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

	let setCSVTranslateRapidMicrosoftApiKey = vscode.commands.registerCommand('fluttergeti18ngenerator.enableordisablefluttergeti18ngeneratortranslatekeyrapidmicrosoft', async () => {
		if (vscode.workspace.workspaceFolders) {
			const value = await vscode.window.showInputBox({prompt: "Rapid Microsoft Api Key", placeHolder: "Example: cssd1223141239e5d122c28c234234sn48werfb2131"});			
			await vscode.workspace.getConfiguration().update('conf.flutter.i18ncsv.rapidapimicrosoft', value, vscode.ConfigurationTarget.Workspace);
			vscode.window.showInformationMessage('Rapid Microsoft Api Key is set!');
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
			const translateRapidMicrosoftKey = vscode.workspace.getConfiguration().get('conf.flutter.i18ncsv.rapidapimicrosoft', '').trim();
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
						if (translateRapidMicrosoftKey === '') {
							vscode.window.showErrorMessage("Not set Rapid Microsoft Api Key.");
							return new Promise<void>(resolve => {resolve();});
						}
						progress.report({message: "Translating app_i18n.csv file..."});
						try {
							await translateCSVFile(value, document.fileName, translateRapidMicrosoftKey);
						} catch (ex){
							vscode.window.showErrorMessage("Failed translate app_i18n.csv file!");
							return new Promise<void>(resolve => {resolve();});
						}
						
					}
					if (enableGenerate) {
						const dartPath = document.fileName.substring(0, document.fileName.length - 3) + 'dart';
						const dartFileUri = vscode.Uri.parse(dartPath);
						progress.report({message: "Reading csv file..."});
						var value : object[];
						try {
							value = await readAppi18nCSVFile(document.fileName);
						} catch (ex){
							vscode.window.showErrorMessage("Read app_i18n.csv file error!");
							return new Promise<void>(resolve => {resolve();});
						}
						progress.report({message: "Generating dart file..."});
						var content = generateDartFile(value);
						progress.report({message: "Saving dart file..."});
						await saveDartFile(dartFileUri, content);
					}
					return new Promise<void>(resolve => {resolve();});
				});
			}
		}
    });

	context.subscriptions.push(enableDartGenerator);
	context.subscriptions.push(enableCSVTranslate);
	context.subscriptions.push(setCSVTranslateRapidMicrosoftApiKey);
	context.subscriptions.push(enableDartGeneratorCSV);
}

export function deactivate() {}