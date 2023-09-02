/* eslint-disable @typescript-eslint/naming-convention */
const axios = require('axios');

export class Translate {
	apiKey: string;
	fromLanguage: string;
	translateParams: TranslateParam[];

	constructor(apiKey: string, fromLanguage: string) {
		this.apiKey = apiKey;
		this.fromLanguage = fromLanguage;
		this.translateParams = [];
	}

	addTranslateRequest(toLanguages: ToLanguage[], value: string, rowIndex: number) {
		let groupCount = Math.floor(toLanguages.length / 21 + 1);
		for (let i = 0; i < groupCount; i ++) {
			let temp = toLanguages.splice(0, 21);
			let translateParam = new TranslateParam(value, temp, rowIndex);
			this.translateParams.push(translateParam);
		}
	}

	request(): Promise<TranslateParam[]> {
		let requestFuncs = this.translateParams.map( element => this.translateFunction(element) );
		return Promise.all(requestFuncs)
			.then(
				results => {
					return results;
				}
			);
	}

	async translateFunction(translateParam: TranslateParam) : Promise<TranslateParam>  {
		let paramsContent = {
			'api-version': '3.0',
			from: this.fromLanguage,
			profanityAction: 'NoAction',
			textType: 'plain'
		};
		for(let toLanguageIndex = 0; toLanguageIndex < translateParam.toLanguages.length; toLanguageIndex++) {
			paramsContent = Object.defineProperty(paramsContent, 'to[' + toLanguageIndex + ']', {
					value: translateParam.toLanguages[toLanguageIndex].to, writable : true,
					enumerable : true,
					configurable : true}
				);
		}
		var options = {
			method: 'POST',
			url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
			params: paramsContent,
			headers: {
				'content-type': 'application/json',
				'X-RapidAPI-Key': this.apiKey,
				'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
			},
			data: [
				{
					Text: translateParam.value
				}
			],
			timeout: 30000
		};
		return axios.request(options).then( (response: any) => {
			for ( let index = 0 ; index < translateParam.toLanguages.length ; index++ ) {
				translateParam.toLanguages[index].value = response.data[0].translations[index].text;
			}
			return translateParam;
		}).catch((error: any) => {
			for ( let index = 0 ; index < translateParam.toLanguages.length ; index++ ) {
				translateParam.toLanguages[index].value = translateParam.value;
			}
			return translateParam;
		});
	};
}

class TranslateParam {
	value: string;
	toLanguages: ToLanguage[];
	rowIndex: number;
	constructor(value: string, toLanguage: ToLanguage[], rowIndex: number) {
		this.value = value;
		this.toLanguages = toLanguage;
		this.rowIndex = rowIndex;
	}
}

export class ToLanguage {
	to: string;
	columnIndex: number;
	value: string;
	constructor(to: string, columnIndex: number) {
		this.to = to;
		this.columnIndex = columnIndex;
		this.value = '';
	}
}