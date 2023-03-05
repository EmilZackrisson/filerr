import { error } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_URL);

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ url }: { url: URL }) {
	await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

	const userId = String(url.searchParams.get('userId'));
	const userEmail = String(url.searchParams.get('userEmail'));

	if (!userId || !userEmail) {
		return error(400, 'Missing required parameters');
	}

	const record = await pb
		.collection('users')
		.update(userId, { email: userEmail })
		.then(() => {
			return 200;
		})
		.catch(() => {
			return 400;
		});

	// return new Response(record);
}
