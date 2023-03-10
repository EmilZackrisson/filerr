<script lang="ts">
	import type { Models, Account } from 'appwrite';

	export let accountData: Models.Account<Models.Preferences>;
	export let account: Account;

	function logout() {
		account.deleteSession('current').then(() => {
			window.location.reload();
		});
	}
</script>

<nav class="navbar bg-base-100">
	<div class="navbar-start">
		<h3>Filerr</h3>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/">Hem</a></li>
			{#if accountData}
				<li>
					<a href="/profile"
						>Profil: {accountData.name.split(' ')[0]}
						{accountData.name.split(' ')[1].substring(0, 1)}</a
					>
				</li>
			{/if}
		</ul>
	</div>
	<div class="navbar-end">
		{#if accountData}
			<button class="btn btn-primary" on:click={logout}>Logga ut</button>
		{/if}
	</div>
</nav>
