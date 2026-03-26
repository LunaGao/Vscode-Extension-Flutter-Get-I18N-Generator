import * as vscode from 'vscode';
import { readUtf8File, validateAppI18nCSVContent } from '../csv_and_dart_filesystem';
import { logError, logInfo } from '../output';
import type { CsvRow, CsvTable } from '../types';

type LanguageColumnMatch = {
    columnIndex: number;
    csvLocale: string;
    strategy: 'exact' | 'language' | 'region';
};

export class GeneratorIOS {
    i18nCSVFile: vscode.Uri;
    iOSRunnerFolder: vscode.Uri;
    iOSFastlaneMetadataFolder: vscode.Uri;
    constructor() {
        const folders = vscode.workspace.workspaceFolders;
        if (folders === undefined) {
            throw new Error("This function need to working in workspace.");
        }
        if (folders.length > 1) {
            throw new Error("This function need to working with only one workspace.");
        }
        this.i18nCSVFile = vscode.Uri.joinPath(folders![0].uri, "lib/i18n/app_i18n.csv");
        this.iOSRunnerFolder = vscode.Uri.joinPath(folders![0].uri, "ios/Runner");
        this.iOSFastlaneMetadataFolder = vscode.Uri.joinPath(folders![0].uri, "ios/fastlane/metadata");
    }

    private normalizeLocale(locale: string): string {
        return locale.replace('_', '-').toLowerCase();
    }

    private getCsvLocale(header: string): string {
        return header.split('|')[0];
    }

    private getLanguageCode(locale: string): string {
        return this.normalizeLocale(locale).split('-')[0];
    }

    private findLanguageColumnMatch(localeName: string, keys: CsvRow): LanguageColumnMatch | undefined {
        const normalizedLocaleName = this.normalizeLocale(localeName);
        const localeLanguageCode = this.getLanguageCode(localeName);

        for (let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
            const csvLocale = this.getCsvLocale(keys[columnIndex]);
            if (normalizedLocaleName === this.normalizeLocale(csvLocale)) {
                return { columnIndex, csvLocale, strategy: 'exact' };
            }
        }

        for (let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
            const csvLocale = this.getCsvLocale(keys[columnIndex]);
            if (normalizedLocaleName === this.getLanguageCode(csvLocale)) {
                return { columnIndex, csvLocale, strategy: 'language' };
            }
        }

        for (let columnIndex = 1; columnIndex < keys.length; columnIndex++) {
            const csvLocale = this.getCsvLocale(keys[columnIndex]);
            if (localeLanguageCode === this.getLanguageCode(csvLocale)) {
                return { columnIndex, csvLocale, strategy: 'region' };
            }
        }

        return undefined;
    }

    private escapeInfoPlistStringValue(value: string): string {
        return value
            .replaceAll('\\', '\\\\')
            .replaceAll('"', '\\"');
    }

    private updateCFBundleDisplayName(stringsContent: string, value: string): string {
        const lineBreak = stringsContent.includes('\r\n') ? '\r\n' : '\n';
        const lines = stringsContent.split(/\r?\n/);
        const targetLineIndex = lines.findIndex((line) => line.includes('"CFBundleDisplayName"'));

        if (targetLineIndex < 0) {
            throw new Error('CFBundleDisplayName can not matched.');
        }

        const lineMatch = lines[targetLineIndex].match(/^(\s*"CFBundleDisplayName"\s*=\s*")([^"]*)(";.*)$/);
        if (lineMatch === null) {
            throw new Error('CFBundleDisplayName line format is invalid.');
        }

        lines[targetLineIndex] = `${lineMatch[1]}${this.escapeInfoPlistStringValue(value)}${lineMatch[3]}`;
        return lines.join(lineBreak);
    }

    async generateIOSRunnerI18n(value : CsvTable): Promise<void> {
        validateAppI18nCSVContent(value, { requireTitleRow: true });
        const keys: CsvRow = value[0];
        let titleRowIndex = 0;
        for(let rowIndex = 0; rowIndex < value.length; rowIndex++ ) {
            const row: CsvRow = value[rowIndex];
            if (row[0].split('[')[0] === 'title') {
                titleRowIndex = rowIndex;
            }
        }
        const iOSRunnerFiles = await vscode.workspace.fs.readDirectory(this.iOSRunnerFolder);
        for (let fileIndex = 0; fileIndex < iOSRunnerFiles.length; fileIndex++ ) {
            const file = iOSRunnerFiles[fileIndex];
            const ext = file[0].split('.')[1];
            const name = file[0].split('.')[0];
            if (ext === 'lproj') {
                if (name === 'Base') {
                    continue;
                }
                const match = this.findLanguageColumnMatch(name, keys);
                if (match === undefined) {
                    const error = new Error("Language not found: " + name);
                    logError('iOS Runner Sync', error, {
                        file: this.i18nCSVFile,
                        details: [`Failed locale folder: ${name}`],
                    });
                    throw error;
                }
                await this.saveTitleIntoStringsFile(name, value[titleRowIndex][match.columnIndex]);
            }
        }
    }

    async generateIOSFastlaneMetadataTitle(value : CsvTable): Promise<void> {
        validateAppI18nCSVContent(value, { requireTitleRow: true });
        const keys: CsvRow = value[0];
        let titleRowIndex = 0;
        for(let rowIndex = 0; rowIndex < value.length; rowIndex++ ) {
            const row: CsvRow = value[rowIndex];
            if (row[0].split('[')[0] === 'title') {
                titleRowIndex = rowIndex;
            }
        }
        const iOSFastlaneMetadataFiles = await vscode.workspace.fs.readDirectory(this.iOSFastlaneMetadataFolder);
        for (let fileIndex = 0; fileIndex < iOSFastlaneMetadataFiles.length; fileIndex++ ) {
            const file = iOSFastlaneMetadataFiles[fileIndex];
            let name = file[0];
            // 'nb' -> 'no'
            if (name === 'no') {
                name = 'nb';
            }
            if (file[1] === vscode.FileType.Directory) {
                if (name === 'review_information') {
                    continue;
                }
                const match = this.findLanguageColumnMatch(name, keys);
                if (match === undefined) {
                    const error = new Error("Language not found: " + name);
                    logError('Fastlane Metadata Sync', error, {
                        file: this.i18nCSVFile,
                        details: [`Failed locale folder: ${name}`],
                    });
                    throw error;
                }
                logInfo('Fastlane Metadata Sync', `Matched metadata locale via ${match.strategy} strategy.`, {
                    file: this.i18nCSVFile,
                    details: [`Locale: ${match.csvLocale} -> ${name}`],
                });
                await this.saveMetadataNameFile(name, value[titleRowIndex][match.columnIndex]);
            }
        }
    }

    async saveTitleIntoStringsFile(stringsFileName: string, value: string) {
        const stringsFile = vscode.Uri.joinPath(this.iOSRunnerFolder, stringsFileName + ".lproj/InfoPlist.strings");
        try {
            const stringsContent = await readUtf8File(stringsFile);
            const updatedContent = this.updateCFBundleDisplayName(stringsContent, value);
            await vscode.workspace.fs.writeFile(stringsFile, new TextEncoder().encode(updatedContent));
        } catch (error) {
            const wrappedError = error instanceof Error
                ? new Error(`${stringsFile.fsPath}: ${error.message}`)
                : new Error(`${stringsFile.fsPath}: ${String(error)}`);
            logError('iOS Runner Sync', wrappedError, {
                file: stringsFile,
                details: ['Failed module: iOS Runner Sync'],
            });
            throw wrappedError;
        }
    }

    async saveMetadataNameFile(language: string, value: string) {
        if (language === 'nb') {
            language = 'no';
        }
        const nameTxtFile = vscode.Uri.joinPath(this.iOSFastlaneMetadataFolder, language + "/name.txt");
        await vscode.workspace.fs.writeFile(nameTxtFile, new TextEncoder().encode(value.toString()));
    }
}
