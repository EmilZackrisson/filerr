<script lang="ts">
	import type { Models, Databases, Permission, Client } from 'appwrite';
	import { Account } from 'appwrite';
	import toast, { Toaster } from 'svelte-french-toast';
	import {
		PUBLIC_APPWRITE_TEAM_ADMIN_ID,
		PUBLIC_APPWRITE_COLLECTION_ID,
		PUBLIC_APPWRITE_DATABASE_ID
	} from '$env/static/public';

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
	export let request: requestDocument;
	export let teamMembership: Models.TeamList;
	export let databases: Databases;
	export let accountData: Models.Account<Models.Preferences>;
	export let allowDeletion: boolean;
	export let client: Client;

	const account = new Account(client);

	let updateMode: boolean = false;
	let completeReqMode: boolean = false;

	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	};

	let isAdmin = false;

	if (teamMembership.teams.findIndex((team) => team.$id === PUBLIC_APPWRITE_TEAM_ADMIN_ID) !== -1) {
		isAdmin = true;
	}

	async function completeRequest(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const fileLocation = formData.get('fileLocation') as string;
		console.log(fileLocation);
		await databases
			.updateDocument(PUBLIC_APPWRITE_DATABASE_ID, PUBLIC_APPWRITE_COLLECTION_ID, request.id, {
				completed: true,
				completedAt: new Date().toISOString(),
				completedBy: accountData.name,
				type: request.type,
				completedMessage: fileLocation
			})
			.then(async (document) => {
				await sendUserEmail(document.$id, document.$databaseId, document.$collectionId);
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
				status: 'Påbörjad'
			})
			.then(() => {
				toast.success('Markerade förfrågan som påbörjad!');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	}

	function toggleCompletePopup() {
		var popup = document.getElementById('markCompletePopup');
		popup?.classList.toggle('hidden');
	}

	function toggleUpdatePopup() {
		var popup = document.getElementById('updatePopup');
		popup?.classList.toggle('hidden');
	}

	function toggleDeletePopup() {
		var popup = document.getElementById('deletePopup');
		popup?.classList.toggle('hidden');
	}

	async function sendUserEmail(documentId: string, databaseId: string, collectionId: string) {
		const session = await account.getSession('current');
		await fetch(
			'https://tytto0n6yk.execute-api.eu-north-1.amazonaws.com/prod-notify-new/notify/completed',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				mode: 'no-cors',
				body: JSON.stringify({
					eventType: 'completedRequest',
					sessionId: session.$id,
					userId: accountData.$id,
					documentId: documentId,
					databaseId: databaseId,
					collectionId: collectionId
				})
			}
		).catch((e) => {
			console.error(e);
			toast.error('Kunde inte skicka notifikation');
			return e;
		});
	}
</script>

<section class="bg-base-200 container rounded-lg p-4" id="card">
	<Toaster />
	<h3 class="text-2xl font-semibold">{request.name}</h3>
	<p>{request.text}</p>
	<p>Förfrågad av: {request.user}</p>
	<p>Förfrågades den: {new Date(request.$createdAt).toLocaleString('sv-SE', options)}</p>

	<p>Typ: {request.type}</p>
	<p>Status: {request.status}</p>
	{#if request.$updatedAt !== request.$createdAt}
		<p>Uppdaterades den: {new Date(request.$updatedAt).toLocaleString('sv-SE', options)}</p>
	{/if}
	{#if request.completed}
		<p>Completed at: {request.completedAt?.toLocaleString('sv-SE', options)}</p>
		<p>Completed by: {request.completedBy}</p>
	{/if}
	<div class="mt-2">
		{#if !request.completed}
			<button class="btn btn-secondary" on:click={toggleUpdatePopup}>Uppdatera</button>
		{/if}

		{#if isAdmin && !request.completed}
			<button class="btn btn-success" id="completeReqBtn" on:click={toggleCompletePopup}
				>Markera som klar</button
			>
			<button class="btn btn-warning" on:click={() => begunRequest()}>Markera som påbörjad</button>
		{/if}

		{#if allowDeletion || isAdmin}
			<button class="btn bg-error text-black border-transparent" on:click={toggleDeletePopup}
				>Ta bort</button
			>
		{/if}
	</div>
</section>

<div class="markCompletePopup hidden popup" id="markCompletePopup">
	<div class="popup-inner bg-slate-800 flex flex-col gap-3">
		<h3 class="text-2xl font-semibold">Markera som klar</h3>

		<form on:submit={completeRequest} class="flex flex-col">
			<label for="fileLocation">Vart kan användaren hämta filen?</label>
			<input type="text" id="fileLocation" name="fileLocation" class="input w-full max-w-xs" />
			<div>
				<button class="btn btn-success mt-3" type="submit">Markera som klar</button>
				<button class="btn btn-secondary" type="button" on:click={toggleCompletePopup}
					>Avbryt</button
				>
			</div>
		</form>
	</div>
</div>

<div class="updatePopup hidden popup" id="updatePopup">
	<div class="popup-inner bg-slate-800 flex flex-col gap-3">
		<h3 class="text-2xl font-semibold">Uppdatera förfrågan</h3>

		<form on:submit={updateRequest} class="flex flex-col">
			<label for="fileLocation">Filnamn</label>
			<input
				type="text"
				id="fileName"
				name="fileName"
				class="input w-full max-w-xs"
				bind:value={request.fileName}
			/>
			<label for="text">Text</label>
			<input
				type="text"
				id="text"
				name="text"
				class="input w-full max-w-xs"
				bind:value={request.text}
			/>
			<div>
				<button class="btn btn-success mt-3" type="submit">Uppdatera förfrågan</button>
				<button class="btn btn-secondary" type="button" on:click={toggleUpdatePopup}>Avbryt</button>
			</div>
		</form>
	</div>
</div>

<div class="deletePopup hidden popup" id="deletePopup">
	<div class="popup-inner bg-slate-800 flex flex-col gap-3">
		<h3 class="text-2xl font-semibold">Ta bort?</h3>
		<p>Är du säker på att du vill ta bort förfrågan?</p>
		<div>
			<button class="btn bg-error text-black border-transparent" on:click={deleteRequest}
				>Ta bort</button
			>
			<button class="btn" on:click={toggleDeletePopup}>Avbryt</button>
		</div>
	</div>
</div>

<style>
	.popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.hidden {
		display: none;
	}

	.popup-inner {
		padding: 1rem;
		border-radius: 0.5rem;
	}
</style>
