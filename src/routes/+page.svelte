<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import Login from '$lib/Login.svelte';
	import RequestCard from '$lib/RequestCard.svelte';
	import Navbar from '$lib/Navbar.svelte';

	import publicUrl from '$lib/publicUrl';

	const pb = new PocketBase(publicUrl);

	console.log('Logged In: ', pb.authStore.isValid);

	let requests: any = [];
	let admin = false;

	type Request = {
		file: string;
		user: string;
		completed: boolean;
		type: string;
	};

	function logout() {
		pb.authStore.clear();
		window.location.reload();
	}

	async function requestFile(event: Event) {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const file = formData.get('file') as string;
		const type = formData.get('type') as string;
		const data = {
			file: file,
			completed: false,
			type: type,
			user: pb.authStore.model?.id
		};

		const record = await pb
			.collection('requests')
			.create(data)
			.then((data) => {
				getRequests();
				sendNewNotification(data);
			});
	}

	async function getRequests() {
		console.log('Getting requests');
		const records = await pb
			.collection('requests')
			.getFullList(50 /* batch size */, {
				sort: '-created',
				expand: 'user',
				filter: 'completed = false'
			})
			.then((records) => {
				requests = records;
				console.log('Got requests', requests);
			});
	}

	async function sendNewNotification(data: Object) {
		fetch(publicUrl + '/api/node/notify/new', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	}

	if (pb.authStore.isValid) {
		console.log('User: ', pb.authStore.model?.id);
		if (pb.authStore.model?.id === 'jcj1e83y9nsfi3q') {
			console.log('You are admin');
			admin = true;
		}
		getRequests();
	}

	async function removeRequest(id: string) {
		await pb
			.collection('requests')
			.delete(id)
			.then(() => {
				getRequests();
			});
	}

	async function markCompleted(request: Request, id: string) {
		const data = {
			file: request.file,
			user: request.user,
			completed: true,
			type: request.type
		};

		const record = await pb
			.collection('requests')
			.update(id, data)
			.then(() => {
				getRequests();
			});
	}
</script>

<main>
	<Navbar />
	{#if pb.authStore.isValid}
		<div class="container-sm card mt-3">
			<h3>Ansök om fil</h3>
			<form on:submit|preventDefault={requestFile}>
				<label for="file">Vad vill du ha?</label>
				<input type="text" class="form-control mb-3" id="fileInput" name="file" />
				<label for="type">Välj en typ</label>
				<select class="form-select mb-3" name="type">
					<option selected>Välj en typ</option>
					<option value="Spel">Spel</option>
					<option value="Program">Program</option>
					<option value="Annat">Annat</option>
				</select>
				<button type="submit" class="btn btn-primary mb-3">Skicka</button>
			</form>
		</div>
		<div class="container-sm mt-5">
			<h2>Ansökningar</h2>
			<div>
				{#await requests}
					<h3>Laddar...</h3>
				{:then requests}
					{#if requests.length === 0}
						<div class="text-center">
							<h3>Alla ansökningar är klara 👍</h3>
						</div>
					{/if}
					{#each requests as request}
						{#if request.completed === false}
							<RequestCard {request} {admin} />
						{/if}
					{/each}
				{/await}
			</div>
		</div>
	{:else}
		<Login />
	{/if}
</main>

<style>
</style>
