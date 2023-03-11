<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Client,
		Account,
		AppwriteException,
		Databases,
		Query,
		Permission,
		Teams
	} from 'appwrite';
	import type { Models } from 'appwrite';
	import {
		PUBLIC_APPWRITE_PROJECT,
		PUBLIC_APPWRITE_ENDPOINT,
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_COLLECTION_ID
	} from '$env/static/public';
	import Navbar from '../../components/Navbar.svelte';
	import Loader from '../../components/Loader.svelte';
	import UserRequestList from '../../components/UserRequestList.svelte';

	const client = new Client()
		.setEndpoint(PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
		.setProject(PUBLIC_APPWRITE_PROJECT); // Your project ID

	const account = new Account(client);
	const databases = new Databases(client);
	let teams = new Teams(client);
	let teamMembership: Models.TeamList;
	let accountData: Models.Account<Models.Preferences>;
	let requests: FileRequest[] = [];
	let loaded = false;
	let createdAt: Date;

	interface FileRequest {
		fileName: string;
		text?: string;
		completed?: boolean;
		completedAt?: Date;
		completedBy?: string;
		user: string;
		id: string;
		createdAt: Date;
		updatedAt: Date;
		permissions: Permission;
		type: string | 'Annat';
	}

	async function getTeam() {
		teamMembership = await teams.list();
		return teamMembership;
	}

	onMount(async () => {
		try {
			accountData = await account.get();
			let documents = await databases.listDocuments(
				PUBLIC_APPWRITE_DATABASE_ID,
				PUBLIC_APPWRITE_COLLECTION_ID,
				[Query.equal('user', accountData.name)]
			);
			documents.documents.forEach((document) => {
				const request: FileRequest = {
					id: document.$id,
					fileName: document.name,
					text: document.text,
					completed: document.completed,
					createdAt: new Date(document.$createdAt),
					updatedAt: new Date(document.$updatedAt),
					user: document.user,
					permissions: document.$permissions,
					type: document.type
				};
				requests.push(request);
			});
			createdAt = new Date(accountData.$createdAt);
			await getTeam();

			loaded = true;
		} catch (e) {
			if (e instanceof AppwriteException && e.code === 401) {
				console.log('Not logged in');
			} else {
				console.log(e);
			}
		}
	});
</script>

<main class="flex flex-col items-center">
	{#if loaded}
		<Navbar {accountData} {account} />
		<h1 class="text-3xl font-semibold">Profil</h1>

		{#if accountData}
			<section class="container mt-5 flex flex-col items-center">
				<h2>Namn: {accountData.name}</h2>
				<p>E-post: {accountData.email}</p>
				<p>Konto skapat: {createdAt.toLocaleString()}</p>
			</section>
		{/if}

		{#if requests.length !== 0}
			<section class="flex flex-col gap-3 mt-3">
				<h2 class="text-2xl">Dina förfrågningar</h2>
				<UserRequestList {client} {accountData} username={accountData.name} />
			</section>
		{/if}
	{:else}
		<Loader message="Laddar profil" />
	{/if}
</main>

<svelte:head>
	<title>Profil - Filerr</title>
</svelte:head>
