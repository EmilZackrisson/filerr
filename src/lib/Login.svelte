<script lang="ts">
	import PocketBase, { type AuthProviderInfo } from 'pocketbase';
	// import publicUrl from '$lib/publicUrl';
	import { PUBLIC_URL } from '$env/static/public';
	import { provider } from '../../src/stores';
	import Cookies from 'js-cookie';
	const pb = new PocketBase(PUBLIC_URL);

	console.log('Logged In: ', pb.authStore.isValid);

	async function submitLogin(event: Event) {
		// event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const email = formData.get('username') as string;
		const password = formData.get('password') as string;
		console.log(email, password);
		const authData = await pb
			.collection('users')
			.authWithPassword(email, password)
			.then(() => {
				window.location.reload();
			})
			.catch((err) => {
				console.log(err.message);
				if (err.message === 'Failed to authenticate.') {
					alert('Fel användarnamn eller lösenord');
				} else {
					alert('Något gick fel');
				}
			});
	}
</script>

<main>
	<div class="container-sm">
		{#await liststate}
			<div>loading...</div>
		{:then liststate}
			{#each liststate as provider}
				<button on:click={authentikSignIn} class="btn btn-primary">
					{provider.name}
				</button>
			{/each}
		{/await}
	</div>
</main>
