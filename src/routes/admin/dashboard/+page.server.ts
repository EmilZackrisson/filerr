import sdk, { AppwriteException } from 'node-appwrite';
import { env } from '$env/dynamic/public';
import { env as envPrivate } from '$env/dynamic/private';

const client = new sdk.Client()
	.setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT)
	.setProject(env.PUBLIC_APPWRITE_PROJECT)
	.setKey(envPrivate.PRIVATE_APPWRITE_API_KEY);
const users = new sdk.Users(client);

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const requestingUserId = url.searchParams.get('userId');
	const requestingUserSessionId = url.searchParams.get('sessionId');
	if (!(await checkUserSession(requestingUserId!, requestingUserSessionId!))) {
		return { code: 401 };
	}

	const allUsers = await getAllUsers();
	const allRequests = await getAllRequests();

	return { users: allUsers, requests: allRequests };
}

async function getAllUsers() {
	const userList = await users.list();
	return userList;
}

async function checkUserSession(user: string, sessionId: string) {
	try {
		const result = await users.listSessions(user);
		const session = result.sessions.find((session) => session.$id === sessionId);
		if (session !== undefined) return true;
		return false;
	} catch (error) {
		if (error instanceof AppwriteException) {
			console.log(error.message);
			if ((error.code = 404)) return '404, User not found';
			return false;
		}
	}
}

async function getAllRequests() {
	try {
		const database = new sdk.Databases(client);
		const result = await database.listDocuments(
			env.PUBLIC_APPWRITE_DATABASE_ID,
			env.PUBLIC_APPWRITE_COLLECTION_ID
		);
		return result.documents;
	} catch (error) {
		if (error instanceof AppwriteException) {
			console.log(error.message);
			if ((error.code = 404)) return '404, User not found';
			return false;
		}
	}
}
