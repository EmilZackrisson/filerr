<script lang="ts">
	import PocketBase, { type AuthProviderInfo } from 'pocketbase';
	// import publicUrl from '$lib/publicUrl';
	import { PUBLIC_URL } from '$env/static/public';
	import { provider } from '../../src/stores';
	import Cookies from 'js-cookie';
	const pb = new PocketBase(PUBLIC_URL);
	let liststate: Array<AuthProviderInfo> = [];
	let redirecturl = 'http://10.10.0.69:5173/auth/redirect';
	async function listalllogin() {
		const result = await pb.collection('users').listAuthMethods();
		console.log(result);
		liststate = result.authProviders;
		console.log('🚀 ~ file: Login.svelte:14 ~ listalllogin ~ liststate:', liststate);
	}
	listalllogin();
	async function authentikSignIn() {
		// localStorage.setItem('provider', JSON.stringify(liststate));
		// provider.set(liststate);
		const providerName = liststate[0].name;
		const providerCodeVerifier = liststate[0].codeVerifier;
		// document.cookie =
		// 	'providerName=' + providerName + ', providerCodeVerifier' + providerCodeVerifier;
		Cookies.set('providerName', providerName);
		Cookies.set('providerCodeVerifier', providerCodeVerifier);
		window.location.href = liststate[0].authUrl + redirecturl;
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
