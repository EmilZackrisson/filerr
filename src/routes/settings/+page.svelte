<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import Login from '$lib/Login.svelte';

	const pb = new PocketBase('https://filerr.local.emilzackrisson.se');

    let admin = false;
	let records: any = [];
    var user: any;
    var userId = pb.authStore.model?.id;

	console.log('Logged In: ', pb.authStore.isValid);

    if(pb.authStore.isValid) {
        console.log('User: ', pb.authStore.model?.id);
        userId = pb.authStore.model?.id;
    }
	

	

	function logout() {
		pb.authStore.clear();
		window.location.reload();
	}

    async function getUser() {
        if(userId === undefined) {
            console.log("User is undefined")
            return;
        }
        const gotUser = await pb.collection('users').getOne(userId).then((user) => {
            console.log("Got user", user);
            
        }).then((gotUser) => {
            user = gotUser
    })}

    getUser();
 


</script>

<main>
	<!-- Header -->
	<div class="container text-center">
		<div class="d-flex justify-content-between flex-row">
			<h3>Filerr</h3>
			<div class="d-flex justify-content-end align-items-center">
				{#if pb.authStore.isValid}
					<p>{pb.authStore.model?.email}</p>
					<button on:click={logout} class="btn btn-primary">Logga ut</button>
				{/if}
			</div>
		</div>
	</div>

	<header class="container text-center">
		<h1>Inställningar</h1>
	</header>

	<section class="container">
		{#if pb.authStore.isValid}
			<div class="card">
				<p>{pb.authStore.model?.email}</p>
                
			</div>
		{:else}
			<Login />
		{/if}
	</section>
</main>

<style>
</style>
