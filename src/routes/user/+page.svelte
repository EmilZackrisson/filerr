<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Account, Teams, type Models } from 'appwrite';
	import {
		PUBLIC_APPWRITE_PROJECT,
		PUBLIC_APPWRITE_ENDPOINT,
		PUBLIC_URL
	} from '$env/static/public';
	import Navbar from '../../components/Navbar.svelte';
	import Loader from '../../components/Loader.svelte';

	const client = new Client()
		.setEndpoint(PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
		.setProject(PUBLIC_APPWRITE_PROJECT); // Your project ID

	const account = new Account(client);
	let accountData: Models.Account<Models.Preferences>;
	let teamsData: Models.TeamList;

	let loggedIn = false;
	let isAllowed = false;
	let requestedUser: Models.Account<Models.Preferences>;

	/** @type {import('./$types').PageData} */
	export let data;
	console.log('🚀 ~ file: +page.svelte:26 ~ data:', data);

	onMount(async () => {
		accountData = await account.get();
		await checkIfAllowed();
		if (!isAllowed) return;

		// await getRequestedUser(userId);
		loggedIn = accountData.$id !== (null || undefined);
	});

	async function checkIfAllowed() {
		const teams = new Teams(client);
		teamsData = await teams.list();
		teamsData.teams.forEach((team) => {
			if (team.$id === 'admins') {
				isAllowed = true;
				return;
			}
		});
		// if (accountData.$id === userId) {
		// 	isAllowed = true;
		// }
	}
</script>

{#if loggedIn}
	<Navbar {accountData} {account} />
{/if}

<main>
	{#if loggedIn}
		{#if isAllowed}
			<h1 class="text-3xl font-semibold">Användare:</h1>
		{:else}
			<h1 class="text-3xl font-semibold">Du har inte behörighet att komma hit.</h1>
		{/if}
	{:else}
		<Loader message="Laddar" />
	{/if}
</main>
