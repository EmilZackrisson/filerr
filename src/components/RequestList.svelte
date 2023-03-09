<script lang="ts">
	import { PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID } from '$env/static/public';
	import { Permission, Teams, type Account, type Client, type Models } from 'appwrite';
	import { Databases } from 'appwrite';
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
	}

	let requests: FileRequest[] = [];
	async function load() {
		try {
			let documents = await databases.listDocuments(
				PUBLIC_APPWRITE_DATABASE_ID,
				PUBLIC_APPWRITE_COLLECTION_ID
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
				console.log(request);
			});
			await getTeam();
			loadedRequests = true;
		} catch (error) {
			toast.error('Failed to load requests');
		}
	}

	async function getTeam() {
		teamMembership = await teams.list();
		console.log('🚀 ~ file: RequestList.svelte:57 ~ getTeam ~ teamMembership:', teamMembership);

		return teamMembership;
	}

	onMount(async () => {
		await load();
	});
</script>

<section>
	<Toaster />
	{#if loadedRequests}
		{#each requests as request}
			<RequestCard {request} {teamMembership} {databases} {accountData} />
		{/each}
	{:else}
		<Loader message="Laddar ansökningar" />
	{/if}
</section>

<style>
	section {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
