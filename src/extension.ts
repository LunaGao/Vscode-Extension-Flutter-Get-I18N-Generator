import * as vscode from 'vscode';
import { generateDartFile } from './generator';
import { readAppi18nCSVFile, saveDartFile } from './csv_and_dart_filesystem';
import { GeneratorIOS } from './ios/ios_generator';
import { CsvTable } from './types';

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

    let enableDartGeneratorCSV = vscode.workspace.onDidSaveTextDocument(async (document) => {
		if (document.fileName.endsWith('app_i18n.csv')) {
			const enableGenerate = vscode.workspace.getConfiguration().get('conf.flutter.i18ncsv.enable', false);
			if (enableGenerate) {
				const options = {
					location: vscode.ProgressLocation.Notification,
					title: "Flutter i18n Generator",
					cancellable: false,
				};
				vscode.window.withProgress(options, async (progress, token) => {
					let value: CsvTable;
					try {
						value = await readAppi18nCSVFile(document.uri);
					} catch (ex){
						vscode.window.showErrorMessage("Read app_i18n.csv file error!");
						return new Promise<void>(resolve => {resolve();});
					}
					const dartPath = document.fileName.substring(0, document.fileName.length - 3) + 'dart';
					const dartFileUri = vscode.Uri.file(dartPath);
					progress.report({message: "Generating dart file..."});
					var content = generateDartFile(value);
					progress.report({message: "Saving dart file..."});
					await saveDartFile(dartFileUri, content);
					return new Promise<void>(resolve => {resolve();});
				});
			}
		}
    });

	let generateiOSI18n = vscode.commands.registerCommand('fluttergeti18ngenerator.enableordisablefluttergeti18ngeneratoriosi18n', async () => {
		const options = {
			location: vscode.ProgressLocation.Notification,
			title: "Flutter i18n Generator",
			cancellable: false,
		};
		vscode.window.withProgress(options, async (progress, token) => {
			progress.report({message: "Generating iOS i18n..."});
			try {
				let generateiOSI18n = new GeneratorIOS();
				const value = await readAppi18nCSVFile(generateiOSI18n.i18nCSVFile);
				await generateiOSI18n.generateIOSRunnerI18n(value);
				await generateiOSI18n.generateIOSFastlaneMetadataTitle(value);
			} catch (ex) {
				console.log(ex);
				vscode.window.showErrorMessage("Generating iOS i18n error!");
			}
			return new Promise<void>(resolve => {resolve();});
		});
	});

	context.subscriptions.push(enableDartGenerator);
	context.subscriptions.push(enableDartGeneratorCSV);
	context.subscriptions.push(generateiOSI18n);
}

export function deactivate() {}
