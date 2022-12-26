<script lang="ts">
	import PocketBase from 'pocketbase';
	const pb = new PocketBase('https://filerr.local.emilzackrisson.se');

	function logout() {
		pb.authStore.clear();
		window.location.reload();
	}

	async function getUser() {
		if (pb.authStore.model?.id !== undefined) {
			let user = await pb.collection('users').getOne(pb.authStore.model?.id);
			const url = pb.getFileUrl(user, pb.authStore.model.avatar, { thumb: '100x250' });
			user.avatar = url;
			return user;
		}
	}

	var avatar: string;
	var name: string;
	const user = getUser().then((user) => {
		console.log('User: ', user);
		console.log(user?.avatar);
		avatar = user?.avatar;
		name = user?.name;
	});
</script>

<main>
	<nav class="navbar navbar-expand-lg bg-light">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">Filerr</a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					<li class="nav-item">
						<a class="nav-link" aria-current="page" href="/">Hem</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="/settings">Inställningar</a>
					</li>
				</ul>

				{#if pb.authStore.isValid}
					<!-- <p>{pb.authStore.model?.email}</p> -->
					{#await user}
						<p />
					{:then user}
						<div class="profile">
							<img src={avatar} class="avatar" alt="Avatar" />
							<div class="profile-div">
								<h5>Hej {name}</h5>
								<a href="/profile">Profil</a>
								<button on:click={logout} class="btn btn-primary">Logga ut</button>
							</div>
						</div>
					{/await}
				{/if}
			</div>
		</div>
	</nav>
</main>

<style>
	.avatar {
		width: 40px;
	}

	.profile-div {
		display: none;
	}

	.profile:hover .profile-div {
		display: flex;
		flex-direction: column;
		z-index: 100;
		position: absolute;
		right: 30px;
		background-color: #f1f1f1;
		padding: 5px;
	}
</style>
