import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
// import PocketBase from 'pocketbase';
const PocketBase = require('pocketbase/cjs');
dotenv.config();

require('cross-fetch/polyfill');

const pb = new PocketBase(process.env.POCKETBASE_URL);

authPocketbase();

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 8000;

app.get('/', (req: Request, res: Response) => {
	// testSendDiscord();
	res.send('Filerr API');
	res.sendStatus(200);
});

app.post('/api/node/notify/new', (req: Request, res: Response) => {
	try {
		const json = req.body;
		getExtraData(json.user)
			.then((data) => {
				const message = 'New request to Filerr from ' + data.name + ' on ' + json.file;
				sendDiscord(message);
			})
			.then(() => {
				res.sendStatus(200);
				res.send(JSON.stringify(json));
			});
		console.log(req.body);
	} catch (error) {
		res.sendStatus(500);
		res.send(error);
	}
});

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

async function getExtraData(userId: string) {
	try {
		const userdata = await pb.collection('users').getOne(userId);
		return userdata;
	} catch (error) {
		console.log('Error getting extra data: ' + error);
	}
}

async function authPocketbase() {
	try {
		const authData = await pb.admins.authWithPassword(
			process.env.POCKETBASE_ADMIN_USER!,
			process.env.POCKETBASE_ADMIN_PASSWORD!
		);
		console.log('Authenticated as: ' + pb.authStore.model?.id);
	} catch (error) {
		console.log('Error authenticating: ' + error);
	}
}

function sendDiscord(message: string) {
	var request = require('request');

	try {
		request.post(
			//First parameter API to make post request
			process.env.DISCORD_WEBHOOK_URL!,

			//Second parameter DATA which has to be sent to API
			{
				json: {
					username: 'Filerr',
					avatar_url: '',
					content: message
				}
			},

			//Thrid parameter Callack function
			function (error: Error, response: Response, body: any) {
				if (!error && response.statusCode == 201) {
					console.log(body);
				}
			}
		);
	} catch (error) {
		console.log('Error sending discord message: ' + error);
	}
}
