import * as vscode from 'vscode';
import { readUtf8File, validateAppI18nCSVContent } from '../csv_and_dart_filesystem';
import { logError, logInfo } from '../output';
import { CsvRow, CsvTable } from '../types';


export class GeneratorIOS {
    i18nCSVFile: vscode.Uri;
    iOSRunnerFolder: vscode.Uri;
    iOSFastlaneMetadataFolder: vscode.Uri;
    constructor() {
        let folders = vscode.workspace.workspaceFolders;
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

    async generateIOSRunnerI18n(value : CsvTable): Promise<void> {
        validateAppI18nCSVContent(value, { requireTitleRow: true });
        const keys: CsvRow = value[0];
        var titleRowIndex = 0;
        for(let rowIndex = 0; rowIndex < value.length; rowIndex++ ) {
            const row: CsvRow = value[rowIndex];
            if (row[0].split('[')[0] === 'title') {
                titleRowIndex = rowIndex;
            }
        }
        let iOSRunnerFiles = await vscode.workspace.fs.readDirectory(this.iOSRunnerFolder);
        for (let fileIndex = 0; fileIndex < iOSRunnerFiles.length; fileIndex++ ) {
            var file = iOSRunnerFiles[fileIndex];
            let ext = file[0].split('.')[1];
            var name = file[0].split('.')[0];
            if (ext === 'lproj') {
                if (name === 'Base') {
                    continue;
                }
                var isFound = false;
                for (let columnIndex = 0; columnIndex < keys.length; columnIndex++) {
                    var element = keys[columnIndex];
                    var keyName = element.split("|")[0].replace("_", "-");
                    if (name === keyName) {
                        await this.saveTitleIntoStringsFile(name, value[titleRowIndex][columnIndex]);
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    for (let columnIndex = 0; columnIndex < keys.length; columnIndex++) {
                        var element = keys[columnIndex];
                        var keyName = element.split("|")[0].split('_')[0];
                        if (name === keyName) {
                            await this.saveTitleIntoStringsFile(name, value[titleRowIndex][columnIndex]);
                            isFound = true;
                            break;
                        }
                    }
                }
                if (!isFound) {
                    const error = new Error("Language not found: " + name);
                    logError('iOS Runner Sync', error, {
                        file: this.i18nCSVFile,
                        details: [`Failed locale folder: ${name}`],
                    });
                    throw error;
                }
            }
        }
    }

    async generateIOSFastlaneMetadataTitle(value : CsvTable): Promise<void> {
        validateAppI18nCSVContent(value, { requireTitleRow: true });
        const keys: CsvRow = value[0];
        var titleRowIndex = 0;
        for(let rowIndex = 0; rowIndex < value.length; rowIndex++ ) {
            const row: CsvRow = value[rowIndex];
            if (row[0].split('[')[0] === 'title') {
                titleRowIndex = rowIndex;
            }
        }
        let iOSFastlaneMetadataFiles = await vscode.workspace.fs.readDirectory(this.iOSFastlaneMetadataFolder);
        for (let fileIndex = 0; fileIndex < iOSFastlaneMetadataFiles.length; fileIndex++ ) {
            var file = iOSFastlaneMetadataFiles[fileIndex];
            var name = file[0];
            // 'nb' -> 'no'
            if (name === 'no') {
                name = 'nb';
            }
            if (file[1] === vscode.FileType.Directory) {
                if (name === 'review_information') {
                    continue;
                }
                var isFound = false;
                for (let columnIndex = 0; columnIndex < keys.length; columnIndex++) {
                    var element = keys[columnIndex];
                    var keyName = element.split("|")[0].replace("_", "-");
                    if (name === keyName) {
                        logInfo('Fastlane Metadata Sync', 'Matched metadata locale.', {
                            file: this.i18nCSVFile,
                            details: [`Locale: ${keyName} -> ${name}`],
                        });
                        await this.saveMetadataNameFile(name, value[titleRowIndex][columnIndex]);
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    for (let columnIndex = 0; columnIndex < keys.length; columnIndex++) {
                        var element = keys[columnIndex];
                        var keyName = element.split("|")[0].split('_')[0];
                        if (name === keyName) {
                            logInfo('Fastlane Metadata Sync', 'Matched metadata locale via language fallback.', {
                                file: this.i18nCSVFile,
                                details: [`Locale: ${keyName} -> ${name}`],
                            });
                            await this.saveMetadataNameFile(name, value[titleRowIndex][columnIndex]);
                            isFound = true;
                            break;
                        }
                    }
                }
                if (!isFound) {
                    for (let columnIndex = 0; columnIndex < keys.length; columnIndex++) {
                        var element = keys[columnIndex];
                        var keyName = element.split("|")[0].split('_')[0];
                        if (name.split('-')[0] === keyName) {
                            logInfo('Fastlane Metadata Sync', 'Matched metadata locale via region fallback.', {
                                file: this.i18nCSVFile,
                                details: [`Locale: ${keyName} -> ${name}`],
                            });
                            await this.saveMetadataNameFile(name, value[titleRowIndex][columnIndex]);
                            isFound = true;
                            break;
                        }
                    }
                }
                if (!isFound) {
                    const error = new Error("Language not found: " + name);
                    logError('Fastlane Metadata Sync', error, {
                        file: this.i18nCSVFile,
                        details: [`Failed locale folder: ${name}`],
                    });
                    throw error;
                }
            }
        }
    }

    async saveTitleIntoStringsFile(stringsFileName: string, value: string) {
        var stringsFile = vscode.Uri.joinPath(this.iOSRunnerFolder, stringsFileName + ".lproj/InfoPlist.strings");
        var stringsContent = await readUtf8File(stringsFile);
        var regexp = /"CFBundleDisplayName"[ ]+=[ ]+"(.*)";/;
        var groups = stringsContent.match(regexp);
        if (groups?.length! >= 2) {
            var cFBundleDisplayNameString = groups![0];
            var preName = groups![1];
            var newCFBundleDisplayNameString = cFBundleDisplayNameString.replace(preName, value.toString());
            stringsContent = stringsContent.replace(cFBundleDisplayNameString, newCFBundleDisplayNameString);
            await vscode.workspace.fs.writeFile(stringsFile, new TextEncoder().encode(stringsContent));
        } else {
            const error = new Error(stringsFile + " CFBundleDisplayName can not matched.");
            logError('iOS Runner Sync', error, {
                file: stringsFile,
                details: ['Failed module: iOS Runner Sync'],
            });
            throw error;
        }
    }

    async saveMetadataNameFile(language: string, value: string) {
        if (language === 'nb') {
            language = 'no';
        }
        var nameTxtFile = vscode.Uri.joinPath(this.iOSFastlaneMetadataFolder, language + "/name.txt");
        await vscode.workspace.fs.writeFile(nameTxtFile, new TextEncoder().encode(value.toString()));
    }
}
