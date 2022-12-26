<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	const pb = new PocketBase('https://filerr.emilzackrisson.se');

	var admin = false;

	let users: any = getAllUsers();

	if (pb.authStore.model?.id === 'jcj1e83y9nsfi3q') {
		admin = true;
		console.log('You are admin');
	}

	async function getAllUsers() {
		// you can also fetch all records at once via getFullList
		users = await pb
			.collection('users')
			.getFullList(200 /* batch size */, {
				sort: '-created'
			})
			.then((users) => {
				return users;
			});
	}
</script>

<main>
	<div class="container-sm card mt-4">
		<h4 class="text-center mt-3">Användare</h4>
		{#await users}
			<div class="text-center">
				<h3>Laddar användare...</h3>
			</div>
		{:then users}
			{#each users as user}
				<div class="card m-2 p-2">
					<h5>{user.name} - {user.username}</h5>
					<p>{user.email}</p>
					<p>Skapad: {user.created}</p>
					<button class="btn btn-danger">Ta bort</button>
				</div>
			{/each}
		{:catch error}
			<div class="text-center">
				<h3>{error}</h3>
			</div>
		{/await}
	</div>
</main>
