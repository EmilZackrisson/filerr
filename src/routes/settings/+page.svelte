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

	function logout() {
		pb.authStore.clear();
		window.location.reload();
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
			<div class="card">
				<p>{pb.authStore.model?.email}</p>
			</div>
			<Users />
			<NewUser />
		{:else}
			<Login />
		{/if}
	</section>
</main>

<style>
</style>
