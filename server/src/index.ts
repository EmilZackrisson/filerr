import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
const { webhookUrl } = require('./config.json');

dotenv.config();

const app: Express = express();
const port = 8000;

app.get('/', (req: Request, res: Response) => {
	// testSendDiscord();
	res.send('Filerr Notification API');
});

app.post('/api/node/notify/new', (req: Request, res: Response) => {
	const json = req.body;
	const message = 'New request to Filerr from ' + json.name + ' on ' + json.file;
	sendDiscord(message);
	res.send(JSON.stringify(json));
});

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

function sendDiscord(message: string) {
	var request = require('request');

	request.post(
		//First parameter API to make post request
		webhookUrl,

		//Second parameter DATA which has to be sent to API
		{
			json: {
				username: 'Filerr',
				avatar_url: '',
				content: 'This is a test message'
			}
		},

		//Thrid parameter Callack function
		function (error: Error, response: Response, body: any) {
			if (!error && response.statusCode == 201) {
				console.log(body);
			}
		}
	);
}
