<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import publicUrl from '$lib/publicUrl';

	const pb = new PocketBase(publicUrl);

	import moment from 'moment';
	moment.locale('sv');

	type Request = {
		file: string;
		user: string;
		completed: boolean;
		type: string;
	};

	export let request: any;
	export let admin: boolean;

	async function removeRequest(id: string) {
		await pb
			.collection('requests')
			.delete(id)
			.then(() => {
				// getRequests();
				window.location.reload();
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
				// getRequests();
				window.location.reload();
			});
	}
</script>

<main>
	<div class="card p-3">
		<div class="d-flex justify-content-between">
			<h5>{request.file}</h5>
			<p>{moment(request.created).fromNow()}</p>
		</div>

		<p>Från användare: {request.expand.user.name}</p>
		<p>Typ: {request.type}</p>

		<!-- <p>Klar: {request.completed}</p> -->
		<div>
			{#if request.user === pb.authStore.model?.id || admin}
				<button
					class="btn btn-danger"
					on:click={() => {
						removeRequest(request.id);
					}}>Ta bort</button
				>
			{/if}
			{#if admin}
				<button
					class="btn btn-success"
					on:click={() => {
						markCompleted(request, request.id);
					}}>Markera som klar</button
				>
			{/if}
		</div>
	</div>
</main>
