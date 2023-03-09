<script lang="ts">
	import { type Models, type Databases, Permission } from 'appwrite';
	import { Role } from 'appwrite';
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
	}
	export let request: FileRequest;
	export let teamMembership: Models.TeamList;
	export let databases: Databases;
	export let accountData: Models.Account<Models.Preferences>;

	async function completeRequest() {
		await databases
			.updateDocument(
				PUBLIC_APPWRITE_DATABASE_ID,
				PUBLIC_APPWRITE_COLLECTION_ID,
				request.id,
				{
					completed: true,
					completedAt: new Date().toISOString(),
					completedBy: accountData.name
				},
				[Permission.update(Role.team('admin'))]
			)
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
	{#if request.completedAt !== request.updatedAt}
		<p>Updated at: {request.updatedAt}</p>
	{/if}
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
