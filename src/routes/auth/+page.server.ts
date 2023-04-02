import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }: {params: any}) {

    

    throw error(404, 'Not found');
}