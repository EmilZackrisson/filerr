<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Account, ID, AppwriteException } from 'appwrite';
	import type { Models } from 'appwrite';
	import { PUBLIC_APPWRITE_PROJECT, PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';
	import Navbar from '../components/Navbar.svelte';
	import RequestList from '../components/RequestList.svelte';
	import Loader from '../components/Loader.svelte';

	const client = new Client()
		.setEndpoint(PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
		.setProject(PUBLIC_APPWRITE_PROJECT); // Your project ID

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
		account.createOAuth2Session('authentik', 'http://10.10.0.69:5173', 'http://10.10.0.69:5173');
	}
</script>

<main>
	{#if loading}
		<Loader message="" />
	{:else if loggedIn}
		<Navbar {accountData} {account} />
		<h1>Välkommen {accountData.name}!</h1>
		<RequestList {client} />
	{:else}
		<button on:click={login}>Login</button>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
