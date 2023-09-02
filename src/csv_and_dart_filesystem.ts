import fs = require('fs');
import csv = require('csv');
import * as vscode from 'vscode';

export async function readAppi18nCSVFile(csvFile: string): Promise<object[]>{
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