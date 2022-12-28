<script lang="ts">
	import PocketBase, { Record } from 'pocketbase';
	import publicUrl from '$lib/publicUrl';

	const pb = new PocketBase(publicUrl);

	var admin = false;
	let vpnUrl: string;

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
				users.map((user: any) => {
					const url = pb.getFileUrl(user, user.vpnConfig);
					const avatar = pb.getFileUrl(user, user.avatar);
					user.avatar = avatar;
					user.vpnConfig = url;
				});
				console.log(users);
				return users;
			});
	}
</script>

<main>
	<div class="">
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
					{#if user.vpnConfig.includes('.zip')}
						<div>
							<a href={user.vpnConfig}> Ladda ner VPN konfiguration </a>
						</div>
					{/if}
				</div>
			{/each}
		{:catch error}
			<div class="text-center">
				<h3>{error}</h3>
			</div>
		{/await}
	</div>
</main>
