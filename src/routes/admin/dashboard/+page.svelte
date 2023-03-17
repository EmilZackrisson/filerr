<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { Models } from 'appwrite';
	import { Client, Databases, Teams, Account } from 'appwrite';
	import Loader from '../../../components/Loader.svelte';
	import UserList from '../../../components/admin/UserList.svelte';
	import RequestCard from '../../../components/RequestCard.svelte';
	import { onMount } from 'svelte';
	import Navbar from '../../../components/Navbar.svelte';

	/** @type {import('./$types').PageData} */
	export let data: Data;
	let loading = true;

	const client = new Client()
		.setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT) // Your API Endpoint
		.setProject(env.PUBLIC_APPWRITE_PROJECT); // Your project ID

	const databases = new Databases(client);
	const teams = new Teams(client);
	const account = new Account(client);

	let teamMembership: Models.TeamList;
	let accountData: Models.Account<Models.Preferences>;

	type Data = {
		// @ts-expect-error
		users: Models.UserList<Models.Preferences>;
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

	onMount(async () => {
		teamMembership = await teams.list();

		accountData = await account.get();
		loading = false;
	});
</script>

{#if !loading}
	<Navbar {accountData} {account} />
	<main class="flex flex-col justify-center items-center gap-5">
		<header class="flex justify-center">
			<h1 class="text-4xl font-semibold">Dashboard</h1>
		</header>
		<h2 class="text-2xl">Användare</h2>
		<UserList userList={data.users} allRequests={data.requests} />
		<h2 class="text-2xl">Alla förfrågningar</h2>
		<p>Totalt antal: {data.requests.length}</p>
		{#each data.requests as request}
			<RequestCard
				{request}
				{teamMembership}
				{databases}
				{accountData}
				allowDeletion={true}
				{client}
			/>
		{/each}
	</main>
{:else}
	<Loader message="Laddar dashboard" />
{/if}
