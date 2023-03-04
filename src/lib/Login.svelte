<script lang="ts">
	import PocketBase, { type AuthProviderInfo } from 'pocketbase';
	import { PUBLIC_URL } from '$env/static/public';
	import Cookies from 'js-cookie';
	const pb = new PocketBase(PUBLIC_URL);
	let liststate: Array<AuthProviderInfo> = [];
	let redirectUrl = PUBLIC_URL + '/auth/redirect';

	async function listalllogin() {
		try {
			const result = await pb.collection('users').listAuthMethods();
			console.log(result);
			liststate = result.authProviders;
		} catch (error) {
			console.error('Error while getting auth providers: ', error);
		}
	}
	listalllogin();
	async function authentikSignIn() {
		const providerName = liststate[0].name;
		const providerCodeVerifier = liststate[0].codeVerifier;
		Cookies.set('providerName', providerName);
		Cookies.set('providerCodeVerifier', providerCodeVerifier);
		window.location.href = liststate[0].authUrl + redirectUrl;
	}
</script>

<main>
	<div class="container-sm login-container">
		<h1>Logga in</h1>
		{#await liststate}
			<div>loading...</div>
		{:then liststate}
			{#each liststate as provider}
				<button on:click={authentikSignIn} class="btn btn-authentik">Authentik</button>
			{/each}
		{/await}
	</div>
</main>

<style>
	.btn-authentik {
		background-color: #fc4a2c;
		color: #fff;
	}

	.login-container {
		margin-top: 10%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
