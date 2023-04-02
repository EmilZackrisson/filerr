import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.auth = auth.handleRequest(event);
    return await resolve(event);
};
const session = await event.locals.auth.validate();
const { session, user } = await event.locals.auth.validateUser();