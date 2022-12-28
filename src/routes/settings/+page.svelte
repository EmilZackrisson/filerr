<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import Login from '$lib/Login.svelte';
	import NewUser from '$lib/NewUser.svelte';
	import Users from '$lib/Users.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import publicUrl from '$lib/publicUrl';

	const pb = new PocketBase(publicUrl);

	let admin = false;
	let records: any = [];
	var user = getUser();
	var userId = pb.authStore.model?.id;

	console.log('Logged In: ', pb.authStore.isValid);

	if (pb.authStore.isValid) {
		console.log('User: ', pb.authStore.model?.id);
		userId = pb.authStore.model?.id;
	}

	async function getUser() {
		if (userId === undefined) {
			console.log('User is undefined');
			return;
		}
		const gotUser = await pb
			.collection('users')
			.getOne(userId)
			.then((user) => {
				console.log('Got user', user);
			});
	}
</script>

<main>
	<Navbar />

	<header class="container text-center">
		<h1>Inställningar</h1>
	</header>

	<section class="container">
		{#if pb.authStore.isValid}
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
				<div class="accordion-item">
					<h2 class="accordion-header" id="headingTwo">
						<button
							class="accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target="#collapseTwo"
							aria-expanded="true"
							aria-controls="collapseTwo"
						>
							Skapa användare
						</button>
					</h2>
					<div
						id="collapseTwo"
						class="accordion-collapse collapse "
						aria-labelledby="headingTwo"
						data-bs-parent="#user-accordion"
					>
						<div class="accordion-body">
							<NewUser />
						</div>
					</div>
				</div>
			</div>
		{:else}
			<Login />
		{/if}
	</section>
</main>

<style>
</style>
