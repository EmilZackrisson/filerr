<script lang="ts">
	import type { Models, Databases } from 'appwrite';
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
	}
	export let request: FileRequest;
	export let teamMembership: Models.TeamList;
	export let databases: Databases;

	async function completeRequest() {
		await databases
			.updateDocument(PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID, request.id, {
				completed: true
			})
			.then(() => {
				toast.success('Markerade förfrågan som klar!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}
</script>

<section>
	<Toaster />
	<h3>{request.fileName}</h3>
	<p>{request.text}</p>
	<p>Requested by: {request.user}</p>
	<p>Requested at: {request.createdAt}</p>
	<p>Updated at: {request.updatedAt}</p>
	{#if request.completed}
		<p>Completed at: {request.completedAt}</p>
		<p>Completed by: {request.completedBy}</p>
	{/if}
	{#if teamMembership.teams.find((team) => team.$id === PUBLIC_APPWRITE_TEAM_ADMIN_ID)}
		<div class="action-row">
			<button on:click={() => completeRequest()}>Complete</button>
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
</style>
