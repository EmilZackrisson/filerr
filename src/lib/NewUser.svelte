<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import publicUrl from '$lib/publicUrl';

	import { PUBLIC_URL } from '$env/static/public';

	const pb = new PocketBase(PUBLIC_URL);

	var admin = false;

	if (pb.authStore.model?.id === 'jcj1e83y9nsfi3q') {
		admin = true;
		console.log('You are admin');
	}

	async function createUser(e: Event) {
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const name = formData.get('name') as string;
		const username = formData.get('username') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const passwordConfirm = formData.get('passwordConfirm') as string;

		const data = {
			username: username,
			email: email,
			emailVisibility: true,
			password: password,
			passwordConfirm: passwordConfirm,
			name: name
		};

		const record = await pb
			.collection('users')
			.create(data)
			.then(() => {
				// console.log('User created');
				alert('Användare skapad');
				window.location.reload();
			});
	}
</script>

<main>
	<div class="">
		<form on:submit|preventDefault={createUser} class="m-4 d-flex flex-column">
			<label class="form-label" for="name">Namn</label>
			<input class="form-control" type="text" name="name" id="namn" />
			<label class="form-label" for="username">Användarnamn</label>
			<input class="form-control" type="text" name="username" id="username" />
			<label class="form-label" for="email">E-post</label>
			<input class="form-control" type="email" name="email" id="email" />
			<label class="form-label" for="password">Lösenord</label>
			<input class="form-control" type="password" name="password" id="password" />
			<label class="form-label" for="passwordConfirm">Bekräfta lösenord</label>
			<input class="form-control" type="password" name="passwordConfirm" id="passwordConfirm" />
			<button type="submit" class="btn btn-primary mt-3">Skapa användare</button>
		</form>
	</div>
</main>
