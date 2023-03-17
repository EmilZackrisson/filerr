// @ts-nocheck
import { error } from '@sveltejs/kit';

/** @param {Parameters<import('./$types').PageServerLoad>[0]} event */
export async function load({ url }) {
	console.log(url.searchParams.get('id'));
	const userId = url.searchParams.get('id');
	if (userId === null) {
		throw error(404, 'Not found');
	}
	return {
		userId: userId
	};
	// throw error(404, 'Not found');
}
