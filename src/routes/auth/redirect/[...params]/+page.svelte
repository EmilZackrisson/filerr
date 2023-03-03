<script lang="ts">
	import PocketBase, { type AuthProviderInfo } from 'pocketbase';
	// import { page } from '$app/stores';
	import { page } from '$app/stores';
	// import publicUrl from '$lib/publicUrl';
	import { PUBLIC_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import Cookies from 'js-cookie';

	const pb = new PocketBase(PUBLIC_URL);

	let redirectUrl = 'http://10.10.0.69:5173/auth/redirect';

	let content: string;

	onMount(() => {
		const providerName = Cookies.get('providerName');
		const providerCodeVerifier = Cookies.get('providerCodeVerifier');

		page.subscribe((page) => {
			const search = page.url.search;
			const code = search.split('&')[0].substring(6);
			const state = search.split('&')[1].substring(6);

			console.log('code', code);
			console.log('state', state);

			content = 'Authenticating';

			if (providerName !== undefined && providerCodeVerifier !== undefined) {
				// authenticate

				var randomstring = Math.random().toString(36).slice(-8);

				pb.collection('users')
					.authWithOAuth2(providerName, code || '', providerCodeVerifier, redirectUrl)
					.then((authData) => {
						content = JSON.stringify(authData, null, 2);
						console.log(content);
						window.location.href = '/';
					})
					.catch((err) => {
						content = 'Failed to exchange code.\n' + err;
					});
			}
		});
	});
</script>

<main>
	{content}
	<a href="/">Home</a>
</main>
