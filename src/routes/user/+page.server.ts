import sdk, { AppwriteException } from 'node-appwrite';
import { PRIVATE_APPWRITE_API_KEY } from '$env/static/private';
import {
	PUBLIC_APPWRITE_ENDPOINT,
	PUBLIC_APPWRITE_PROJECT,
	PUBLIC_APPWRITE_DATABASE_ID,
	PUBLIC_APPWRITE_COLLECTION_ID
} from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }: { url: URL }) {
	const requestedUserId = url.searchParams.get('searchId');
	const requestedUserName = url.searchParams.get('name');
	const requestingUserId = url.searchParams.get('userId');
	const requestingUserSessionId = url.searchParams.get('sessionId');
	if (!(await checkUserSession(requestingUserId!, requestingUserSessionId!))) {
		return { code: 401 };
	}
	let requestedUser;

	if (requestedUserId !== null) {
		requestedUser = await getRequestedUser(requestedUserId!);
	} else if (requestedUserName !== null) {
		requestedUser = await getUserByName(requestedUserName);
	} else {
		return;
	}

	const filterdRequestedUser = filterUserData(
		requestedUser as sdk.Models.User<sdk.Models.Preferences>
	);
	const usersRequests = await getUsersRequests(requestedUserId!);
	return { user: filterdRequestedUser, requests: usersRequests };

	// throw error(404, 'Not found');
}

async function checkUserSession(user: string, sessionId: string) {
	try {
		const client = new sdk.Client();
		client
			.setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
			.setProject(PUBLIC_APPWRITE_PROJECT)
			.setKey(PRIVATE_APPWRITE_API_KEY);
		const users = new sdk.Users(client);
		const result = await users.listSessions(user);
		const session = result.sessions.find((session) => session.$id === sessionId);
		// console.log(session);
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

async function getRequestedUser(userId: string) {
	try {
		const client = new sdk.Client();
		client
			.setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
			.setProject(PUBLIC_APPWRITE_PROJECT)
			.setKey(PRIVATE_APPWRITE_API_KEY);
		const users = new sdk.Users(client);
		const result = await users.get(userId);
		return result;
	} catch (error) {
		if (error instanceof AppwriteException) {
			// console.log(error.message);
			if ((error.code = 404)) return '404, User not found';
			return false;
		}
	}
}

async function getUsersRequests(userId: string) {
	try {
		const client = new sdk.Client();
		client
			.setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
			.setProject(PUBLIC_APPWRITE_PROJECT)
			.setKey(PRIVATE_APPWRITE_API_KEY);
		const database = new sdk.Databases(client);
		const result = await database.listDocuments(
			PUBLIC_APPWRITE_DATABASE_ID,
			PUBLIC_APPWRITE_COLLECTION_ID
		);
		// @ts-expect-error
		let filterdResult = result.documents.filter((document) => (document.user = userId));
		return filterdResult;
	} catch (error) {
		if (error instanceof AppwriteException) {
			console.log(error.message);
			if ((error.code = 404)) return '404, User not found';
			return false;
		}
	}
}

function filterUserData(user: sdk.Models.User<sdk.Models.Preferences>) {
	const filterdUser = {
		$id: user.$id,
		name: user.name,
		email: user.email,
		$createdAt: user.$createdAt,
		$updatedAt: user.$updatedAt
	};
	return filterdUser;
}

async function getUserByName(name: string) {
	try {
		const client = new sdk.Client();
		client
			.setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
			.setProject(PUBLIC_APPWRITE_PROJECT)
			.setKey(PRIVATE_APPWRITE_API_KEY);
		const users = new sdk.Users(client);
		const result = await users.list();
		const user = result.users.find((user) => user.name === name);
		return user;
	} catch (error) {
		if (error instanceof AppwriteException) {
			console.log(error.message);
			if ((error.code = 404)) return '404, User not found';
			return false;
		}
	}
}
