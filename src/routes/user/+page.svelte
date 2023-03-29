<!-- /admin/dashboard?userId=6408935300ed2cef7dd1&sessionId=641333cc781ed29c7bf6 -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, Account, Teams, type Models } from 'appwrite';
	import { env } from '$env/dynamic/public';
	import Navbar from '../../components/Navbar.svelte';
	import Loader from '../../components/Loader.svelte';
	import UserRequestList from '../../components/UserRequestList.svelte';

	const client = new Client()
		.setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
		.setProject(env.PUBLIC_APPWRITE_PROJECT); // Your project ID

	const account = new Account(client);
	let accountData: Models.Account<Models.Preferences>;
	let teamsData: Models.TeamList;

	let loggedIn = false;
	let isAllowed = false;

	/** @type {import('./$types').PageData} */
	export let data: any;

	onMount(async () => {
		accountData = await account.get();
		if (data.allowed === false) return;

		// await getRequestedUser(userId);
		loggedIn = accountData.$id !== (null || undefined);
	});

	type Data = {
		user: Models.Account<Models.Preferences>;
		requests: requestDocument[];
	};

	type requestDocument = Models.Document & {
		user: string;
		name: string;
		text: string;
		type: string;
		completed: boolean;
		completedAt: Date;
		completedBy: string;
		completedMessage: string;
		status: string;
	};
</script>

{#if loggedIn}
	<Navbar {accountData} {account} />
{/if}

<main class="flex flex-col justify-center items-center gap-5 p-3">
	{#if loggedIn}
		{#if isAllowed}
			<section class="container flex flex-col items-center">
				<h1 class="text-3xl font-semibold">{data.user.name}</h1>
				<p>Email: {data.user.email}</p>
				<p>Skapad: {data.user.$createdAt}</p>
				<p>Senast uppdaterad: {data.user.$updatedAt}</p>
				<p>Antal förfrågningar: {data.requests.length}</p>
			</section>

			<UserRequestList {client} {accountData} username={data.user.name} />
		{:else}
			<h1 class="text-3xl font-semibold">Du har inte behörighet att komma hit.</h1>
		{/if}
	{:else}
		<Loader message="Laddar" />
	{/if}
</main>

<!--<svelte:head>-->
<!--	<title>{data.user.name} - Filerr</title>-->
<!--</svelte:head>-->
