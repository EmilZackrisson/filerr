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
	export let username: string;

	let teams = new Teams(client);
	const databases = new Databases(client);
	let loadedRequests = false;
	let teamMembership: Models.TeamList;

	let uniqueKey = {};

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

	let requests: FileRequest[] = [];
	async function load() {
		try {
			let documents = await databases.listDocuments(
				PUBLIC_APPWRITE_DATABASE_ID,
				PUBLIC_APPWRITE_COLLECTION_ID,
				[Query.equal('user', accountData.name)]
			);

			// Testar
			const subscriptionChannel = 'collections.' + PUBLIC_APPWRITE_COLLECTION_ID + '.documents';
			client.subscribe([subscriptionChannel, 'documents'], (response) => {
				// Callback will be executed on changes for documents A and all files.
				// @ts-expect-error
				if (response.payload.user !== username) return;

				if (response.events[0].includes('.create')) {
					const payload: Models.Document = response.payload as Models.Document;
					const request: FileRequest = {
						id: payload.$id,
						fileName: payload.name,
						text: payload.text,
						completed: payload.completed,
						createdAt: new Date(payload.$createdAt),
						updatedAt: new Date(payload.$updatedAt),
						user: payload.user,
						permissions: payload.$permissions,
						completedAt: new Date(payload.completedAt),
						completedBy: payload.completedBy,
						type: payload.type
					};
					requests.push(request);
					uniqueKey = {};
				}
				if (response.events[0].includes('.update')) {
					const payload: Models.Document = response.payload as Models.Document;
					const request: FileRequest = {
						id: payload.$id,
						fileName: payload.name,
						text: payload.text,
						completed: payload.completed,
						createdAt: new Date(payload.$createdAt),
						updatedAt: new Date(payload.$updatedAt),
						user: payload.user,
						permissions: payload.$permissions
					};
					requests = requests.map((r) => {
						if (r.id === request.id) {
							return request;
						}
						return r;
					});
					uniqueKey = {};
				}
				if (response.events[0].includes('.delete')) {
					const payload: Models.Document = response.payload as Models.Document;
					requests = requests.filter((r) => r.id !== payload.$id);
					uniqueKey = {};
				}
			});

			documents.documents.forEach((document) => {
				const request: FileRequest = {
					id: document.$id,
					fileName: document.name,
					text: document.text,
					completed: document.completed,
					completedAt: new Date(document.completedAt),
					completedBy: document.completedBy,
					createdAt: new Date(document.$createdAt),
					updatedAt: new Date(document.$updatedAt),
					user: document.user,
					permissions: document.$permissions,
					type: document.type
				};
				requests.push(request);
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

<section class="flex flex-col gap-3">
	<Toaster />
	{#if loadedRequests}
		{#each requests as request}
			{#key uniqueKey}
				<RequestCard {request} {teamMembership} {databases} {accountData} allowDeletion={false} />
			{/key}
		{/each}
	{:else}
		<Loader message="Laddar ansökningar" />
	{/if}
</section>
