<script lang="ts">
	import PocketBase, { type RecordAuthResponse } from 'pocketbase';
	// import { page } from '$app/stores';
	import { page } from '$app/stores';
	// import publicUrl from '$lib/publicUrl';
	import { PUBLIC_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import Cookies from 'js-cookie';
	import { generateUsername } from 'unique-username-generator';

	const pb = new PocketBase(PUBLIC_URL);

	let redirectUrl = PUBLIC_URL + '/auth/redirect';

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
				const randomUsername = generateUsername();

				pb.collection('users')
					.authWithOAuth2(providerName, code || '', providerCodeVerifier, redirectUrl)
					.then((authData) => {
						updateUserInfo(authData).then(() => {
							content = JSON.stringify(authData, null, 2);
							console.log(content);
							window.location.href = '/';
						});
					})
					.catch((err) => {
						content = 'Failed to exchange code.\n' + err;
						console.error(err);
					});
			}
		});
	});

	async function updateUserInfo(response: RecordAuthResponse) {
		if (response.meta !== undefined && pb.authStore.isValid) {
			const data = {
				username: response.meta.username,
				name: response.meta.name
			};
			console.log('Got user data from oAuth', data);
			await pb
				.collection('users')
				.update(pb.authStore.model!.id, data)
				.catch((e) => {
					console.error(e);
				})
				.then(() => {
					console.log('updated user info');
				});
			// await updateEmail(response.meta.email, response.record.id);
		}
	}

	async function updateEmail(email: string, userId: string) {
		const url = '/auth/change/email?userId=' + userId + '&email=' + email;
		const res = await fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(() => {
				console.log('updated email');
				console.log(res);
			})
			.catch((error) => {
				console.error(error);
			});
	}
</script>

<main>
	{content}
	<a href="/">Home</a>
</main>
