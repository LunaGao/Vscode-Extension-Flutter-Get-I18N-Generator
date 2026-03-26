import * as vscode from 'vscode';
import { generateDartFile } from './generator';
import { readAppi18nCSVFile, saveDartFile } from './csv_and_dart_filesystem';
import { GeneratorIOS } from './ios/ios_generator';
import { getOutputChannel, logError, logInfo } from './output';
import { CsvTable } from './types';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = getOutputChannel();

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
						logInfo('CSV Reader', 'Reading app_i18n.csv before Dart generation.', {
							file: document.uri,
						});
						value = await readAppi18nCSVFile(document.uri);
					} catch (ex) {
						logError('CSV Reader', ex, {
							file: document.uri,
							details: ['Failed module: CSV Reader'],
						});
						vscode.window.showErrorMessage("Read app_i18n.csv file error. Check Flutter i18n Generator output.");
						return new Promise<void>(resolve => {resolve();});
					}
					const dartPath = document.fileName.substring(0, document.fileName.length - 3) + 'dart';
					const dartFileUri = vscode.Uri.file(dartPath);
					try {
						progress.report({message: "Generating dart file..."});
						logInfo('Dart Generator', 'Generating app_i18n.dart content.', {
							file: document.uri,
							details: [`Output file: ${dartFileUri.fsPath}`],
						});
						const content = generateDartFile(value);
						progress.report({message: "Saving dart file..."});
						await saveDartFile(dartFileUri, content);
					} catch (ex) {
						logError('Dart Generator', ex, {
							file: document.uri,
							details: [`Output file: ${dartFileUri.fsPath}`],
						});
						vscode.window.showErrorMessage("Generate app_i18n.dart file error. Check Flutter i18n Generator output.");
						return new Promise<void>(resolve => {resolve();});
					}
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
				const generateiOSI18n = new GeneratorIOS();
				logInfo('iOS Generator', 'Starting iOS localization sync.', {
					file: generateiOSI18n.i18nCSVFile,
				});
				const value = await readAppi18nCSVFile(generateiOSI18n.i18nCSVFile);
				await generateiOSI18n.generateIOSRunnerI18n(value);
				await generateiOSI18n.generateIOSFastlaneMetadataTitle(value);
			} catch (ex) {
				logError('iOS Generator', ex, {
					details: ['Failed module: iOS Generator'],
				});
				vscode.window.showErrorMessage("Generating iOS i18n error. Check Flutter i18n Generator output.");
			}
			return new Promise<void>(resolve => {resolve();});
		});
	});

	context.subscriptions.push(outputChannel);
	context.subscriptions.push(enableDartGenerator);
	context.subscriptions.push(enableDartGeneratorCSV);
	context.subscriptions.push(generateiOSI18n);
}

export function deactivate() {}
