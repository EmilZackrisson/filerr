import fetch from 'cross-fetch';
import sdk = require('node-appwrite');

const client = new sdk.Client();
const users = new sdk.Users(client);

// Init Appwrite SDK
client
	.setEndpoint(process.env.APPWRITE_ENDPOINT!) // Your API Endpoint
	.setProject(process.env.APPWRITE_PROJECT!) // Your project ID
	.setKey(process.env.APPWRITE_KEY!); // Your secret API key

// Handler
exports.handler = async function (event: any, context: any, callback: any) {
	console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
	console.log('## CONTEXT: ' + serialize(context));
	console.log('## EVENT: ' + serialize(event));
	console.log(event);
	try {
		const body = event;
		if (checkSession(body.userId, body.sessionId)) {
			if (body.eventType === 'newRequest') {
				console.log('New request event received');
				callback(formatResponse(await notifyNew(body)));
			} else {
				console.log('Unknown event type received');
				callback(
					formatError({ statusCode: 400, code: 'Bad Request', message: 'Unknown event type' })
				);
			}
		} else {
			console.log('Invalid session from user: ', body.requestData.user);
			callback(formatError({ statusCode: 401, code: 'Unauthorized', message: 'Invalid session' }));
		}
	} catch (error) {
		console.error('Error while handling event: ', error);
		callback(formatError({ statusCode: 500, code: 'Internal Server Error', message: error }));
	}
};

var formatResponse = function (body: any) {
	console.log('Response: ', body);
	var response = {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json'
		},
		isBase64Encoded: false,
		// multiValueHeaders: {
		// 	'X-Custom-Header': ['My value', 'My other value']
		// },
		body: body
	};
	return response;
};

var formatError = function (error: any) {
	console.log('Error: ', error);
	var response = {
		statusCode: error.statusCode,
		headers: {
			'Content-Type': 'text/plain',
			'x-amzn-ErrorType': error.code
		},
		isBase64Encoded: false,
		body: error.code + ': ' + error.message
	};
	return response;
};

var serialize = function (object: object) {
	return JSON.stringify(object, null, 2);
};

async function notifyNew(event: object) {
	const eventBody: newRequest = event as newRequest;
	await sendDiscord(
		eventBody.requestData.user,
		eventBody.requestData.filename,
		eventBody.requestData.text,
		eventBody.requestData.type
	)
		.then(() => {
			return formatResponse('OK');
		})
		.catch(() => {
			return formatError({
				statusCode: 500,
				code: 'Internal Server Error',
				message: 'Error while sending new request to Discord'
			});
		});
}

async function sendDiscord(user: string, filename: string, text?: string, type?: string) {
	var params = {
		username: 'Filerr',
		embeds: [
			{
				title: 'Ny förfrågan',
				color: 15258703,
				url: 'https://filerr.emilzackrisson.se',
				author: {
					name: user
				},
				description: `${user} förfrågade om filen ${filename}.`,
				fields: [
					{
						name: 'Typ',
						value: type,
						inline: true
					},
					{
						name: 'Text',
						value: text,
						inline: false
					}
				]
			}
		]
	};

	try {
		const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
		console.log('Sending new request to Discord: ', params);
		console.log('Webhook URL: ', WEBHOOK_URL);
		await fetch(WEBHOOK_URL!, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(params)
		}).then((res) => {
			console.log('Discord webhook response: ', serialize(res));
		});
	} catch (error) {
		console.error('Error while sending new request to Discord: ', error);
		return formatError(error);
	}
}

async function checkSession(userId: string, sessionId: string) {
	const userSessions = await users.listSessions(userId);
	const session = userSessions.sessions.find((session: any) => session.$id === sessionId);
	if (session) {
		return true;
	}
	return false;
}

type newRequest = {
	eventType: string;
	userId: string;
	sessionId: string;
	requestData: {
		user: string;
		filename: string;
		text: string;
		type: string;
	};
};
