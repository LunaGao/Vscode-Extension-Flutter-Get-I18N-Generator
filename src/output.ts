import * as vscode from 'vscode';

type LogOptions = {
	details?: string[];
	file?: string | vscode.Uri;
	show?: boolean;
};

let outputChannel: vscode.OutputChannel | undefined;

function formatFile(file?: string | vscode.Uri): string | undefined {
	if (file === undefined) {
		return undefined;
	}
	if (typeof file === 'string') {
		return file;
	}
	return file.fsPath;
}

function getTimestamp(): string {
	return new Date().toISOString();
}

function appendLines(lines: string[], show = false): void {
	const channel = getOutputChannel();
	lines.forEach((line) => channel.appendLine(line));
	if (show) {
		channel.show(true);
	}
}

export function getOutputChannel(): vscode.OutputChannel {
	if (outputChannel === undefined) {
		outputChannel = vscode.window.createOutputChannel('Flutter i18n Generator');
	}
	return outputChannel;
}

export function logInfo(moduleName: string, message: string, options: LogOptions = {}): void {
	const file = formatFile(options.file);
	const lines = [`[${getTimestamp()}] [${moduleName}] ${message}`];

	if (file !== undefined) {
		lines.push(`File: ${file}`);
	}
	if (options.details !== undefined) {
		options.details.forEach((detail) => lines.push(detail));
	}

	appendLines(lines, options.show ?? false);
}

export function logError(moduleName: string, error: unknown, options: LogOptions = {}): void {
	const file = formatFile(options.file);
	const lines = [`[${getTimestamp()}] [${moduleName}] ERROR`];

	if (file !== undefined) {
		lines.push(`File: ${file}`);
	}
	if (options.details !== undefined) {
		options.details.forEach((detail) => lines.push(detail));
	}

	if (error instanceof Error) {
		lines.push(`Message: ${error.message}`);
		if (error.stack !== undefined) {
			lines.push(error.stack);
		}
	} else {
		lines.push(`Message: ${String(error)}`);
	}

	appendLines(lines, options.show ?? true);
}
