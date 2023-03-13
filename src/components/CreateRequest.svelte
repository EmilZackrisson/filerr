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
	const account = new Account(client);

	const databases = new Databases(client);

	async function submitRequest(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
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
				await databases
					.createDocument(
						PUBLIC_APPWRITE_DATABASE_ID,
						PUBLIC_APPWRITE_COLLECTION_ID,
						ID.unique(),
						request,
						[Permission.update(Role.user(accountData.$id))]
					)
					.then(async () => {
						await sendNotification(request.name!, request.text!, request.type!).then(() => {
							toast.success('Din förfrågan har skickats!');
						});
					});

				// @ts-expect-error
				e.target.reset();
			} catch (error) {
				// @ts-expect-error
				toast.error(error.message);
			}
		}
	}

	async function sendNotification(filename: string, text: string, type: string) {
		const session = await account.getSession('current');
		await fetch(
			'https://tytto0n6yk.execute-api.eu-north-1.amazonaws.com/prod-notify-new/notify/new',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				mode: 'no-cors',
				body: JSON.stringify({
					eventType: 'newRequest',
					sessionId: session.$id,
					userId: accountData.$id,
					requestData: {
						user: accountData.name,
						filename: filename,
						text: text,
						type: type
					}
				})
			}
		).catch((e) => {
			console.error(e);
			toast.error('Kunde inte skicka notifikation');
			return e;
		});
	}
</script>

<form
	on:submit|preventDefault={submitRequest}
	class="container bg-base-200 p-3 rounded-lg flex flex-col"
	id="submitForm"
>
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
	<button type="submit" class="btn btn-primary mt-4">Skicka förfrågan</button>
</form>
