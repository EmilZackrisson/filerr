<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import Login from '$lib/Login.svelte';
	import NewUser from '$lib/NewUser.svelte';
	import Users from '$lib/Users.svelte';
	import Navbar from '$lib/Navbar.svelte';

	import { PUBLIC_URL } from '$env/static/public';
	import { get } from 'jquery';

	const pb = new PocketBase(PUBLIC_URL);

	var userId = pb.authStore.model?.id;

	console.log('Logged In: ', pb.authStore.isValid);

	if (pb.authStore.isValid && pb.authStore.model?.id !== undefined) {
		console.log('User: ', pb.authStore.model?.id);
		userId = pb.authStore.model?.id;
		const user = getUser(userId);
	}

	async function getUser(RECORD_ID: string) {
		const record = await pb.collection('users').getOne('RECORD_ID');
		console.log(record);
		return record;
	}
</script>

<main>
	<Navbar />

	<section class="container">
		{#if pb.authStore.isValid}
			{#await getUser then user}
				<header class="container text-center">
					<h1>Inställningar</h1>
				</header>
				<div class="accordion" id="user-accordion">
					<div class="accordion-item">
						<h2 class="accordion-header" id="headingOne">
							<button
								class="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseOne"
								aria-expanded="false"
								aria-controls="collapseOne"
							>
								Användare
							</button>
						</h2>
						<div
							id="collapseOne"
							class="accordion-collapse collapse"
							aria-labelledby="headingOne"
							data-bs-parent="#user-accordion"
						>
							<div class="accordion-body">
								<Users />
							</div>
						</div>
					</div>
				</div>
			{/await}
		{:else}
			<Login />
		{/if}
	</section>
</main>

<style>
</style>
