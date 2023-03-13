async function sendDiscord(user, filename, text, type) {
	var params = {
		username: 'Filerr',
		content: text,
		embeds: [
			{
				title: user + ' förfrågade ' + filename,
				color: 15258703,
				url: 'https://filerr.emilzackrisson.se'
			}
		]
	};

	try {
		const WEBHOOK_URL =
			'https://discordapp.com/api/webhooks/1058084109991297104/PcPcCssBBYApdLbx7-_n09zUaThJAhKJNaprRu-jA_-wPoZDlYkq2iD52iHENmPQSYrb';
		console.log('Sending new request to Discord: ', params);
		console.log('Webhook URL: ', WEBHOOK_URL);
		fetch(WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(params)
		}).then((res) => {
			console.log(res);
		});
	} catch (error) {
		console.error('Error while sending new request to Discord: ', error);
		return formatError(error);
	}
}

sendDiscord('emil', 'heja lambda', 'bajs', 'skit');
