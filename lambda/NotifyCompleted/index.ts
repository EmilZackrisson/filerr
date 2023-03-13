import * as nodemailer from 'nodemailer';
import * as sdk from 'node-appwrite';

const client = new sdk.Client();
const users = new sdk.Users(client);
const database = new sdk.Databases(client);

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
		const body: body = event;
		if (checkSession(body.userId, body.sessionId)) {
			if (body.eventType === 'completedRequest') {
				console.log('Completed request event received');
				const user = await getUser(body.userId);
				const request = await getDocument(body.documentId);
				await sendUserEmail(user.email, request.name).then(() => {
					console.log('Email sent');
					callback(formatResponse({ statusCode: 200, body: 'Success' }));
				});
			} else {
				console.log('Unknown event type received');
				callback(
					formatError({ statusCode: 400, code: 'Bad Request', message: 'Unknown event type' })
				);
			}
		} else {
			console.log('Invalid session from user: ', body.userId);
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

async function checkSession(userId: string, sessionId: string) {
	const userSessions = await users.listSessions(userId);
	const session = userSessions.sessions.find((session: any) => session.$id === sessionId);
	if (session.$id === sessionId) {
		return true;
	} else {
		return false;
	}
}

async function getUser(userId: string) {
	const user = await users.get(userId);
	return user;
}

async function getDocument(documentId: string) {
	const document: any = await database.get(documentId);
	return document;
}

async function sendUserEmail(userEmail: string, filename: string) {
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
			subject: `${filename} är redo!`, // Subject line
			text: `${filename} är redo!`, // plain text body
			html: `<h1>${filename} är redo!</h1>` // html body
		});
		console.log('Email sent: %s', info.messageId);
	} catch (error) {
		console.error('Error while sending email: ', error);
		return formatError({ statusCode: 500, code: 'Internal Server Error', message: error });
	}
}

type body = {
	eventType: string;
	userId: string;
	sessionId: string;
	documentId: string;
};
