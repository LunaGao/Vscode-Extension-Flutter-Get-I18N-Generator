import * as vscode from 'vscode';
import { readAppi18nCSVFile, saveDartFile } from './csv_and_dart_filesystem';
import { generateDartFile } from './generator';
import { GeneratorIOS } from './ios/ios_generator';
import { getOutputChannel, logError, logInfo } from './output';
import type { CsvTable } from './types';

const generatorConfigKey = 'conf.flutter.i18ncsv.enable';
const generatorProgressOptions: vscode.ProgressOptions = {
	location: vscode.ProgressLocation.Notification,
	title: 'Flutter i18n Generator',
	cancellable: false,
};

function isDartGeneratorEnabled(): boolean {
	return vscode.workspace.getConfiguration().get(generatorConfigKey, false);
}

async function updateDartGeneratorEnabled(value: boolean): Promise<void> {
	await vscode.workspace.getConfiguration().update(generatorConfigKey, value, vscode.ConfigurationTarget.Workspace);
}

async function promptEnableDisable(placeHolder: string): Promise<boolean | undefined> {
	const value = await vscode.window.showQuickPick(['Enable', 'Disable'], { placeHolder });

	if (value === undefined) {
		return undefined;
	}

	return value === 'Enable';
}

async function withGeneratorProgress(task: (progress: vscode.Progress<{ message?: string }>) => Promise<void>): Promise<void> {
	await vscode.window.withProgress(generatorProgressOptions, async (progress) => {
		await task(progress);
	});
}

async function handleToggleDartGenerator(): Promise<void> {
	if (!vscode.workspace.workspaceFolders) {
		return;
	}

	const saveValue = await promptEnableDisable('Select the flutter app_i18n.dart generate enable or disable.');
	if (saveValue === undefined) {
		return;
	}

	await updateDartGeneratorEnabled(saveValue);
	if (saveValue) {
		vscode.window.showInformationMessage('Enable app_i18n.dart auto generate!');
	} else {
		vscode.window.showInformationMessage('Disable app_i18n.dart auto generate!');
	}
}

async function readCsvForDartGeneration(document: vscode.TextDocument): Promise<CsvTable | undefined> {
	try {
		logInfo('CSV Reader', 'Reading app_i18n.csv before Dart generation.', {
			file: document.uri,
		});
		return await readAppi18nCSVFile(document.uri);
	} catch (error) {
		logError('CSV Reader', error, {
			file: document.uri,
			details: ['Failed module: CSV Reader'],
		});
		vscode.window.showErrorMessage('Read app_i18n.csv file error. Check Flutter i18n Generator output.');
		return undefined;
	}
}

async function generateAndSaveDartFile(document: vscode.TextDocument, content: CsvTable, progress: vscode.Progress<{ message?: string }>): Promise<void> {
	const dartPath = document.fileName.substring(0, document.fileName.length - 3) + 'dart';
	const dartFileUri = vscode.Uri.file(dartPath);

	try {
		progress.report({ message: 'Generating dart file...' });
		logInfo('Dart Generator', 'Generating app_i18n.dart content.', {
			file: document.uri,
			details: [`Output file: ${dartFileUri.fsPath}`],
		});
		const dartContent = generateDartFile(content);
		progress.report({ message: 'Saving dart file...' });
		await saveDartFile(dartFileUri, dartContent);
	} catch (error) {
		logError('Dart Generator', error, {
			file: document.uri,
			details: [`Output file: ${dartFileUri.fsPath}`],
		});
		vscode.window.showErrorMessage('Generate app_i18n.dart file error. Check Flutter i18n Generator output.');
	}
}

async function handleCsvSave(document: vscode.TextDocument): Promise<void> {
	if (!document.fileName.endsWith('app_i18n.csv') || !isDartGeneratorEnabled()) {
		return;
	}

	await withGeneratorProgress(async (progress) => {
		const csvContent = await readCsvForDartGeneration(document);
		if (csvContent === undefined) {
			return;
		}

		await generateAndSaveDartFile(document, csvContent, progress);
	});
}

async function handleGenerateiOSI18n(): Promise<void> {
	await withGeneratorProgress(async (progress) => {
		progress.report({ message: 'Generating iOS i18n...' });

		try {
			const iosGenerator = new GeneratorIOS();
			logInfo('iOS Generator', 'Starting iOS localization sync.', {
				file: iosGenerator.i18nCSVFile,
			});
			const csvContent = await readAppi18nCSVFile(iosGenerator.i18nCSVFile);
			await iosGenerator.generateIOSRunnerI18n(csvContent);
			await iosGenerator.generateIOSFastlaneMetadataTitle(csvContent);
		} catch (error) {
			logError('iOS Generator', error, {
				details: ['Failed module: iOS Generator'],
			});
			vscode.window.showErrorMessage('Generating iOS i18n error. Check Flutter i18n Generator output.');
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = getOutputChannel();
	const enableDartGenerator = vscode.commands.registerCommand(
		'fluttergeti18ngenerator.enableordisablefluttergeti18ngenerator',
		handleToggleDartGenerator
	);
	const enableDartGeneratorCSV = vscode.workspace.onDidSaveTextDocument(handleCsvSave);
	const generateiOSI18n = vscode.commands.registerCommand(
		'fluttergeti18ngenerator.enableordisablefluttergeti18ngeneratoriosi18n',
		handleGenerateiOSI18n
	);

	context.subscriptions.push(outputChannel);
	context.subscriptions.push(enableDartGenerator);
	context.subscriptions.push(enableDartGeneratorCSV);
	context.subscriptions.push(generateiOSI18n);
}

export function deactivate() {}
