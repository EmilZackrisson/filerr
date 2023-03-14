<script lang="ts">
	import { PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID } from '$env/static/public';
	import { Permission, Teams, type Models } from 'appwrite';
	import { Databases, Query, Account, Client } from 'appwrite';
	import { onMount } from 'svelte';
	import Loader from './Loader.svelte';
	import RequestCard from './RequestCard.svelte';
	import toast, { Toaster } from 'svelte-french-toast';

	export let client: Client;
	export let accountData: Models.Account<Models.Preferences>;

	let teams = new Teams(client);
	const databases = new Databases(client);
	let loadedRequests = false;
	let teamMembership: Models.TeamList;

	let uniqueKey = {};

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

	let requests: requestDocument[] = [];
	async function load() {
		try {
			let documents = await databases.listDocuments(
				PUBLIC_APPWRITE_DATABASE_ID,
				PUBLIC_APPWRITE_COLLECTION_ID
			);

			// Testar
			const subscriptionChannel = 'collections.' + PUBLIC_APPWRITE_COLLECTION_ID + '.documents';
			client.subscribe([subscriptionChannel, 'documents'], (response) => {
				// Callback will be executed on changes for documents A and all files.

				if (response.events[0].includes('.create')) {
					const payload: requestDocument = response.payload as requestDocument;
					requests.push(payload);
					uniqueKey = {};
				}
				if (response.events[0].includes('.update')) {
					const payload: requestDocument = response.payload as requestDocument;
					requests = requests.map((r) => {
						if (r.id === payload.id) {
							return payload;
						}
						return r;
					});
					uniqueKey = {};
				}
				if (response.events[0].includes('.delete')) {
					const payload: requestDocument = response.payload as requestDocument;
					requests = requests.filter((r) => r.id !== payload.$id);
					window.location.reload();
					uniqueKey = {};
				}
			});

			documents.documents.forEach((document) => {
				requests.push(document as requestDocument);
			});
			await getTeam();
			loadedRequests = true;
		} catch (error) {
			toast.error('Failed to load requests');
			// @ts-expect-error
			console.error(error.message);
		}
	}

	async function getTeam() {
		teamMembership = await teams.list();

		return teamMembership;
	}

	onMount(async () => {
		await load();
	});
</script>

<section class="container flex flex-col gap-5 mb-5">
	<Toaster />
	<h2 class="text-2xl">Pågående förfrågningar</h2>
	{#if loadedRequests}
		{#each requests as request}
			{#if !request.completed}
				{#key uniqueKey}
					<RequestCard
						{request}
						{teamMembership}
						{databases}
						{accountData}
						allowDeletion={true}
						{client}
					/>
				{/key}
			{/if}
		{/each}
	{:else}
		<Loader message="Laddar ansökningar" />
	{/if}
</section>
