<script lang="ts">
	import type { Models } from 'node-appwrite';
	import { Client, Account } from 'appwrite';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	const client = new Client()
		.setEndpoint(env.PUBLIC_APPWRITE_ENDPOINT)
		.setProject(env.PUBLIC_APPWRITE_PROJECT);
	const account = new Account(client);
	let session: Models.Session;
	let accountData: Models.Account<Models.Preferences>;

	export let userList: Models.UserList<Models.Preferences>;
	export let allRequests: requestDocument[];

	let loading = true;

	onMount(async () => {
		session = await account.getSession('current');
		accountData = await account.get();

		loading = false;
	});

	function count(username: string) {
		let count = 0;
		allRequests.map((request) => {
			if (request.user === username) {
				count++;
			}
		});
		return count;
	}

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

{#if !loading}
	<section class="container flex flex-col justify-center gap-3">
		{#if userList}
			{#each userList.users as user}
				<div class="flex flex-col items-center justify-center bg-slate-800 rounded-lg p-3">
					<h1 class="text-4xl font-semibold">{user.name}</h1>
					<p class="text-2xl">{user.email}</p>
					<p>Skapad: {user.$createdAt}</p>
					<p>ID: {user.$id}</p>
					<p>Antal ansökningar: {count(user.name)}</p>
					<a
						href={`${env.PUBLIC_URL}/user?searchId=${user.$id}&userId=${accountData.$id}&sessionId=${session.$id}`}
						class="text-blue-700">Profil</a
					>
				</div>
			{/each}
		{/if}
	</section>
{:else}
	laddar
{/if}
