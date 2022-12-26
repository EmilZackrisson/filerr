<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	const pb = new PocketBase('https://filerr.emilzackrisson.se');

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
