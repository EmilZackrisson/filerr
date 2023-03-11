<script lang="ts">
	import type { Models, Databases, Permission } from 'appwrite';
	import toast, { Toaster } from 'svelte-french-toast';
	import {
		PUBLIC_APPWRITE_TEAM_ADMIN_ID,
		PUBLIC_APPWRITE_COLLECTION_ID,
		PUBLIC_APPWRITE_DATABASE_ID
	} from '$env/static/public';

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
	export let request: FileRequest;
	export let teamMembership: Models.TeamList;
	export let databases: Databases;
	export let accountData: Models.Account<Models.Preferences>;

	let updateMode: boolean = false;

	let updatedAt = Date.parse(request.updatedAt.toString());
	let createdAt = Date.parse(request.createdAt.toString());
	console.log('updated at', updatedAt);
	console.log('created at', createdAt);

	async function completeRequest() {
		await databases
			.updateDocument(PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID, request.id, {
				completed: true,
				completedAt: new Date().toISOString(),
				completedBy: accountData.name
			})
			.then(() => {
				toast.success('Markerade förfrågan som klar!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function updateRequest(event: Event) {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		await databases
			.updateDocument(PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID, request.id, {
				name: formData.get('fileName') as string,
				text: formData.get('text') as string
			})
			.then(() => {
				toast.success('Uppdaterade förfrågan!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function deleteRequest() {
		await databases
			.deleteDocument(PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID, request.id)
			.then(() => {
				toast.success('Raderade förfrågan!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	async function begunRequest() {
		await databases
			.updateDocument(PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID, request.id, {
				status: 'Pågående'
			})
			.then(() => {
				toast.success('Markerade förfrågan som påbörjad!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
</script>

<section class="bg-base-200">
	<Toaster />
	<h3 class="text-2xl font-semibold">{request.fileName}</h3>
	<p>{request.text}</p>
	<p>Förfrågad av: {request.user}</p>
	<p>Förfrågades den: {request.createdAt.toLocaleString()}</p>
	{#if createdAt != updatedAt}
		<p>Uppdaterades den: {request.updatedAt.toLocaleString()}</p>
	{/if}
	{#if request.completed}
		<p>Completed at: {request.completedAt}</p>
		<p>Completed by: {request.completedBy}</p>
	{/if}
	{#if teamMembership.teams.find((team) => team.$id === PUBLIC_APPWRITE_TEAM_ADMIN_ID)}
		{#if updateMode}
			<form on:submit|preventDefault={updateRequest}>
				<input type="text" id="fileName" name="fileName" bind:value={request.fileName} />
				<input type="text" id="text" name="text" bind:value={request.text} />
				<button type="submit">Skicka</button>
			</form>
		{/if}
		<div class="admin-action-row">
			<button class="btn btn-secondary" on:click={() => (updateMode = !updateMode)}
				>Uppdatera</button
			>
			<button class="btn btn-success" on:click={() => completeRequest()}>Markera som klar</button>
			<button class="btn btn-warning" on:click={() => begunRequest()}>Markera som påbörjad</button>
			<button class="btn bg-warning text-black" on:click={deleteRequest}>Ta bort</button>
		</div>
	{/if}
	{#if request.user === accountData.$id}
		{#if updateMode}
			<form on:submit|preventDefault={updateRequest}>
				<input type="text" id="fileName" name="fileName" bind:value={request.fileName} />
				<input type="text" id="text" name="text" bind:value={request.text} />
				<button type="submit">Skicka</button>
			</form>
		{/if}
		<div class="admin-action-row">
			<button class="btn btn-secondary" on:click={() => (updateMode = !updateMode)}
				>Uppdatera</button
			>
			<button class="btn bg-warning text-black" on:click={deleteRequest}>Ta bort</button>
		</div>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		width: 60%;
		align-items: center;
		border-style: solid;
		border-radius: 0.5rem;
		border-color: black;
		padding: 1rem;
	}

	@media only screen and (max-width: 600px) {
		section {
			width: 95%;
		}
	}
</style>
