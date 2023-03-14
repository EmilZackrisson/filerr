import fetch from 'cross-fetch';
import sdk = require('node-appwrite');
import * as nodemailer from 'nodemailer';

const client = new sdk.Client();
const users = new sdk.Users(client);
const database = new sdk.Databases(client);

// Init Appwrite SDK
client
	.setEndpoint(process.env.APPWRITE_ENDPOINT!) // Your API Endpoint
	.setProject(process.env.APPWRITE_PROJECT!) // Your project ID
	.setKey(process.env.APPWRITE_KEY!); // Your secret API key

// Handler
exports.handler = async function (event: any, context: any) {
	console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
	console.log('## CONTEXT: ' + serialize(context));
	console.log('## EVENT: ' + serialize(event));
	console.log(event);
	try {
		const body = event;
		if (checkSession(body.userId, body.sessionId)) {
			if (body.eventType === 'newRequest') {
				console.log('New request event received');
				await notifyNew(body);
				return formatResponse('Success');
			} else if (body.eventType === 'completedRequest') {
				console.log('Completed request event received');
				const completedRequestBody: body = body;
				const user = await getUser(completedRequestBody.userId);
				const document: requestDocument = await getDocument(
					completedRequestBody.documentId,
					completedRequestBody.databaseId,
					completedRequestBody.collectionId
				);
				await sendUserEmail(user.email, document).then(() => {
					console.log('Email sent');
					return formatResponse('Success');
				});
			} else {
				console.log('Unknown event type received');
				return formatError({ statusCode: 400, code: 'Bad Request', message: 'Unknown event type' });
			}
		} else {
			console.log('Invalid session from user: ', body.requestData.user);
			return formatError({ statusCode: 401, code: 'Unauthorized', message: 'Invalid session' });
		}
	} catch (error) {
		console.error('Error while handling event: ', error);
		return formatError({ statusCode: 500, code: 'Internal Server Error', message: error });
	}
};

var formatResponse = function (body: any) {
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
		return;
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

async function getUser(userId: string) {
	const user = await users.get(userId);
	return user;
}

async function getDocument(documentId: string, databaseId: string, collectionId: string) {
	const document: any = await database.getDocument(databaseId, collectionId, documentId);
	return document;
}

async function sendUserEmail(userEmail: string, document: requestDocument) {
	try {
		let transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER, // generated ethereal user
				pass: process.env.SMTP_PASS // generated ethereal password
			}
		});

		let info = await transporter.sendMail({
			from: `"Filerr" <${process.env.SMTP_EMAIL}>`, // sender address
			to: userEmail, // list of receivers
			subject: `${document.name} är redo!`, // Subject line
			text: `${document.name} är redo!\n https://filerr.emilzackrisson.se"https://filerr.emilzackrisson.se`, // plain text body
			html: `<h1>${document.name} är redo!</h1>
			<p>${document.completedMessage}</p>
			<br>
			<a href="https://filerr.emilzackrisson.se">https://filerr.emilzackrisson.se</a>` // html body
		});
		console.log('Email sent: %s', info.messageId);
	} catch (error) {
		console.error('Error while sending email: ', error);
		return formatError({ statusCode: 500, code: 'Internal Server Error', message: error });
	}
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

type body = {
	eventType: string;
	userId: string;
	sessionId: string;
	documentId: string;
	databaseId: string;
	collectionId: string;
};

type requestDocument = sdk.Models.Document & {
	user: string;
	name: string;
	text: string;
	type: string;
	completed: boolean;
	completedAt: Date;
	completedBy: string;
	completedMessage: string;
	status: string;
};
