<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Account, AppwriteException } from 'appwrite';
	import type { Models } from 'appwrite';
	import { env } from '$env/dynamic/public';
	import Navbar from '../components/Navbar.svelte';
	import RequestList from '../components/RequestList.svelte';
	import Loader from '../components/Loader.svelte';
	import CreateRequest from '../components/CreateRequest.svelte';

	const client = new Client()
		.setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
		.setProject(env.PUBLIC_APPWRITE_PROJECT); // Your project ID

	const account = new Account(client);
	let accountData: Models.Account<Models.Preferences>;
	let loggedIn = false;
	let loading = true;

	onMount(async () => {
		try {
			accountData = await account.get();
			loggedIn = accountData.$id !== (null || undefined);
		} catch (e) {
			if (e instanceof AppwriteException && e.code === 401) {
				console.log('Not logged in');
			} else {
				console.log(e);
			}
		}

		loading = false;
	});

	function login() {
		account.createOAuth2Session('authentik', env.PUBLIC_URL, env.PUBLIC_URL);
	}
</script>

<main>
	{#if loading}
		<Loader message="" />
	{:else if loggedIn}
		<Navbar {accountData} {account} />
		<h1 class="text-3xl font-semibold">Välkommen {accountData.name}!</h1>
		<CreateRequest {client} {accountData} />
		<RequestList {client} {accountData} />
	{:else}
		<div class="container flex flex-col items-center m-10">
			<h1 class="text-3xl font-bold">Filerr</h1>
			<h3 class="text-2xl">Logga in för att skapa en förfrågan</h3>
			<button on:click={login} class="btn btn-primary m-3">Logga in med Authentik</button>
		</div>
	{/if}
</main>

<svelte:head>
	<title>Filerr</title>
</svelte:head>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}
</style>
