// @ts-nocheck
import { error } from '@sveltejs/kit';

/** @param {Parameters<import('./$types').PageServerLoad>[0]} event */
export async function load({ params }: {params: any}) {

    

    throw error(404, 'Not found');
}