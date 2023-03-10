<script lang="ts">
	import { Databases, ID, Role, Permission, Account } from 'appwrite';
	import toast, { Toaster } from 'svelte-french-toast';
	import type { Client, Models } from 'appwrite';
	import {
		PUBLIC_APPWRITE_TEAM_ADMIN_ID,
		PUBLIC_APPWRITE_COLLECTION_ID,
		PUBLIC_APPWRITE_DATABASE_ID
	} from '$env/static/public';

	export let client: Client;
	export let accountData: Models.Account<Models.Preferences>;

	const databases = new Databases(client);

	async function submitRequest(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		console.log(formData);
		if (formData.get('fileName')?.toString().trim() === '') {
			toast.error('Du måste berätta vad du vill ha. Jag kan inte läsa tankar.');
			return;
		}
		if (formData.get('type')?.toString() === '') {
			toast.error('Välj en filtyp');
			return;
		} else {
			const request = {
				name: formData.get('fileName')?.toString().trim(),
				text: formData.get('text')?.toString().trim(),
				user: accountData.name,
				type: formData.get('type')?.toString()
			};
			try {
				await databases.createDocument(
					PUBLIC_APPWRITE_DATABASE_ID,
					PUBLIC_APPWRITE_COLLECTION_ID,
					ID.unique(),
					request,
					[Permission.update(Role.user(accountData.$id))]
				);
				toast.success('Din förfrågan har skickats!');
				// @ts-expect-error
				e.target.reset();
			} catch (error) {
				// @ts-expect-error
				toast.error(error.message);
			}
		}
	}
</script>

<form on:submit|preventDefault={submitRequest} class="bg-base-200" id="submitForm">
	<Toaster />
	<label for="fileName" class="label">Filnamn</label>
	<input type="text" name="fileName" id="fileName" class="input w-full" />
	<label for="text" class="label">Mer information (frivillig)</label>
	<textarea name="text" id="text" class="textarea" />
	<label for="type" class="label">Välj en filtyp</label>
	<select name="type" id="type" class="select select-bordered w-full">
		<option value="">Välj en filtyp</option>
		<option value="Spel">Spel</option>
		<option value="Program">Program</option>
		<option value="Annat">Annat</option>
	</select>
	<button type="submit" class="btn btn-primary">Skicka förfrågan</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		width: 60%;
		gap: 3px;
		padding: 15px;
		border-radius: 5px;
	}
	label {
		display: block;
	}
	input,
	textarea {
		display: block;
	}
	button {
		margin-top: 10px;
	}

	@media only screen and (max-width: 600px) {
		form {
			width: 95%;
		}
	}
</style>
