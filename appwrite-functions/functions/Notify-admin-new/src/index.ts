// import { Models } from 'appwrite';
import { Client } from 'node-appwrite';
import fetch from 'node-fetch';

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req: any, res: any) {
	console.log('Request: ', req);
	const client = new Client();

	// You can remove services you don't use
	// const account = new sdk.Account(client);
	// const avatars = new sdk.Avatars(client);
	// const database = new Databases(client);
	// const functions = new sdk.Functions(client);
	// const health = new sdk.Health(client);
	// const locale = new sdk.Locale(client);
	// const storage = new sdk.Storage(client);
	// const teams = new sdk.Teams(client);
	// const users = new sdk.Users(client);

	if (!req.variables['APPWRITE_FUNCTION_ENDPOINT'] || !req.variables['APPWRITE_FUNCTION_API_KEY']) {
		console.warn('Environment variables are not set. Function cannot use Appwrite SDK.');
	} else {
		client
			.setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
			.setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
			.setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);
	}

	if (
		req.variables['APPWRITE_FUNCTION_EVENT_DATA'] !== null ||
		req.variables['APPWRITE_FUNCTION_EVENT_DATA'] !== undefined
	) {
		const createdDocument: Request = JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA']);
		console.log('Created Document: ', createdDocument);
		await sendDiscord(createdDocument).then(() => {
			console.log('Sent to discord', createdDocument);
			res.send('Success, ' + createdDocument, 200);
		});

		res.send(createdDocument.name + ' förfrågade ' + createdDocument.name);
	}
};

async function sendDiscord(request: Request) {
	const discordWebhook =
		'https://discordapp.com/api/webhooks/1058084109991297104/PcPcCssBBYApdLbx7-_n09zUaThJAhKJNaprRu-jA_-wPoZDlYkq2iD52iHENmPQSYrb';
	const discordMessage = {
		content: request.user + ' förfrågade ' + request.name,
		title: request.name,
		description: request.text,
		url: 'https://filerr.emilzackrisson.se'
	};
	console.log('Discord Message: ', discordMessage);
	await fetch(discordWebhook, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(discordMessage)
	});
}

interface Request extends DocumentType {
	user: string;
	name: string;
	text?: string;
	completed?: boolean;
	completedAt?: string;
	completedBy?: string;
	type: string;
	completedMessage?: string;
	status?: string;
}

type DocumentType = {
	$id: string;
	$collectionId: string;
	$databaseId: string;
	$createdAt: string;
	$updatedAt: string;
	$permissions: string[];
};
