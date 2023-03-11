// import { Models } from 'appwrite';
import { Client, Users } from 'node-appwrite';
const nodemailer = require('nodemailer');

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
	const users = new Users(client);

	if (JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA']).status !== 'Begun') {
		res.send('Admin har inte påbörjat');
		return;
	}

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
		req.variables['APPWRITE_FUNCTION_EVENT_DATA'] !== undefined ||
		req.variables['APPWRITE_FUNCTION_EVENT_DATA'].completedBy !== ''
	) {
		if (req.variables['SMTP_USER'] !== null || req.variables['SMTP_USER'] !== undefined) {
			const updatedDocument: Request = JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA']);
			console.log('Completed Document: ', updatedDocument);
			const user = await users.get(updatedDocument.user);
			const userEmail = user.email;
			sendUserEmail(
				updatedDocument,
				users,
				req.variables['SMTP_HOST'],
				req.variables['SMTP_EMAIL'],
				req.variables['SMTP_USER'],
				req.variables['SMTP_PASS']
			);

			res.send(updatedDocument.completedBy + ' förfrågade ' + updatedDocument.name);
		}
	}
};

async function sendUserEmail(
	request: Request,
	users: Users,
	smtp_host: string,
	smtp_email: string,
	smtp_user: string,
	smtp_pass: string
) {
	let transporter = nodemailer.createTransport({
		host: smtp_host,
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: smtp_user, // generated ethereal user
			pass: smtp_pass // generated ethereal password
		}
	});

	const htmlMessage = '<p>Någon har påbörjat din förfrågan på ' + request.name + '.</p>';

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: 'Filerr' + ' <' + smtp_email + '>', // sender address
		to: getUserEmail(request, users), // list of receivers
		subject: request.name, // Subject line
		text: 'Någon har påbörjat din förfrågan på ' + request.name, // plain text body
		html: htmlMessage // html body
	});

	console.log('Message sent: %s', request);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

async function getUserEmail(request: Request, users: Users) {
	const user = await users.get(request.user);
	const userEmail = user.email;
	return userEmail;
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
