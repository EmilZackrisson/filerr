<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	// import publicUrl from '$lib/publicUrl';
	import { PUBLIC_URL } from '$env/static/public';

	const pb = new PocketBase(PUBLIC_URL);

	let liststate: Array<AuthProviderInfo> = [];
	let redirectUrl = PUBLIC_URL + '/auth/redirect';

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
		window.location.href = liststate[0].authUrl + redirectUrl;
	}
</script>

<main>
	<div class="container-sm">
		<form on:submit|preventDefault={submitLogin}>
			<div class="mb-3">
				<label for="username" class="form-label">Användarnamn</label>
				<input type="text" class="form-control" id="username" name="username" />
			</div>
			<div class="mb-3">
				<label for="password" class="form-label">Lösenord</label>
				<input type="password" class="form-control" id="password" name="password" />
			</div>
			<button type="submit" class="btn btn-primary">Logga in</button>
		</form>
	</div>
</main>
