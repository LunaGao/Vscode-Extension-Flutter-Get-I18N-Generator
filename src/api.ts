const axios = require('axios');

async function translateFromRapidMicrosoftApi(fromLanguage: String, toLanguage: string[], value: String, apiKey: string) {
	//NOTE: Max translate to language count is 20.
	let paramsContent = {
		'api-version': '3.0',
		from: fromLanguage,
		profanityAction: 'NoAction',
		textType: 'plain'
	};
	for(let toLanguageIndex = 0; toLanguageIndex < toLanguage.length; toLanguageIndex++) {
		paramsContent = Object.defineProperty(paramsContent, 'to[' + toLanguageIndex + ']', {
				value: toLanguage[toLanguageIndex], writable : true,
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
			'X-RapidAPI-Key': apiKey,
			'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
		},
		data: [
			{
				Text: value
			}
		]
	};
	try {
		
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		return error;
	}
}

function streamToString(stream: NodeJS.WritableStream) : Promise<string>{
	let chunks: Uint8Array[] = [];
	return new Promise((resolve, reject) => {
	  stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
	  stream.on('error', (err) => reject(err));
	  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}