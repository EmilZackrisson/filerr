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

<nav>
	<h3>Filerr</h3>
	<ul>
		<li><a href="/">Hem</a></li>

		{#if accountData.$id}
			<li>
				<a href="/profile">
					Inloggad som: {accountData.name.split(' ')[0] +
						' ' +
						accountData.name.split(' ')[1].at(0)}
				</a>
			</li>
			<li>
				<button on:click={logout}>Logga ut</button>
			</li>
		{:else}
			<li><a href="/login">Login</a></li>
		{/if}
	</ul>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 3rem;
		width: 100vw;
	}

	nav h3 {
		font-size: 1.5rem;
		margin-left: 10px;
	}

	nav ul {
		display: flex;
		list-style: none;
		gap: 10px;
		align-items: center;
		height: 100%;
		margin: 10px;
	}

	nav ul li {
		display: flex;
		align-items: center;
	}

	nav ul li a {
		text-decoration: none;
		color: #000;
	}

	nav ul li a:hover {
		color: #ccc;
	}
</style>
