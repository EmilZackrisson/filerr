<script lang="ts">
	import { PUBLIC_URL } from '$env/static/public';
	import type { Models, Account } from 'appwrite';
	import { onMount } from 'svelte';

	export let accountData: Models.Account<Models.Preferences>;
	export let account: Account;

	let session: Models.Session;
	let userUrl: string;
	let loading = true;

	function logout() {
		account.deleteSession('current').then(() => {
			window.location.reload();
		});
	}

	onMount(async () => {
		session = await account.getSession('current');
		userUrl = `${PUBLIC_URL}user?searchId=${accountData.$id}&userId=${accountData.$id}&sessionId=${session.$id}`;

		loading = false;
	});
</script>

{#if !loading}
	<nav class="navbar shadow-lg border-none">
		<div class="navbar-start">
			<div class="dropdown">
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label tabindex="0" class="btn btn-ghost btn-circle">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h7"
						/></svg
					>
				</label>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="menu menu-compact dropdown-content mt-5 p-2 shadow-lg bg-base-100 rounded-box w-52"
				>
					<li><a href="/">Hem</a></li>
					{#if accountData}
						<li>
							<a href={userUrl}
								>Profil: {accountData.name.split(' ')[0]}
								{accountData.name.split(' ')[1].substring(0, 1)}</a
							>
						</li>
					{/if}
					<!-- <li><a>About</a></li> -->
				</ul>
			</div>
		</div>
		<div class="navbar-center">
			<a class="btn btn-ghost normal-case text-xl" href="/">Filerr</a>
		</div>
		<div class="navbar-end">
			<button class="btn btn-ghost" on:click={logout}>Logga ut</button>
		</div>
	</nav>
{/if}
