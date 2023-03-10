<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Client,
		Account,
		ID,
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
		PUBLIC_URL,
		PUBLIC_APPWRITE_DATABASE_ID,
		PUBLIC_APPWRITE_COLLECTION_ID
	} from '$env/static/public';
	import Navbar from '../../components/Navbar.svelte';
	import RequestList from '../../components/RequestList.svelte';
	import Loader from '../../components/Loader.svelte';
	import CreateRequest from '../../components/CreateRequest.svelte';
	import RequestCard from '../../components/RequestCard.svelte';

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
		type?: string | 'Annat';
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
				[Query.equal('user', accountData.$id)]
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
					permissions: document.$permissions
				};
				requests.push(request);
			});
			console.log(requests);
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

<main>
	{#if loaded}
		<Navbar {accountData} {account} />
		<h1>Profil</h1>

		{#if accountData}
			<section>
				<h2>Din info</h2>
				<h2>Namn: {accountData.name}</h2>
				<p>E-post: {accountData.email}</p>
				<p>Skapad: {createdAt.toLocaleString()}</p>
			</section>
		{/if}

		{#if requests}
			<section>
				<h2>Dina förfrågningar</h2>
				{#each requests as request}
					<RequestCard {request} {teamMembership} {databases} {accountData} />
				{/each}
			</section>
		{/if}
	{:else}
		<Loader message="Laddar profil" />
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	section {
		width: 95%;
	}
</style>
