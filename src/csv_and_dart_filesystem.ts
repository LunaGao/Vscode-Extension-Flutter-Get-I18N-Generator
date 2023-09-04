import csv = require('csv');
import * as vscode from 'vscode';

export async function readAppi18nCSVFile(csvFile: vscode.Uri): Promise<object[]>{
	var contents = (await vscode.workspace.fs.readFile(csvFile)).toString();
	const p = new Promise<object[]>(async (resolve, reject) => {
		csv.parse(contents, { delimiter: "," }, (error, values) => {
			if (error) {
				reject(error);
			}
			resolve(values);
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