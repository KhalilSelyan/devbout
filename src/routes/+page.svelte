<script lang="ts">
	import { authClient } from '$lib/auth-client';

	const { data } = $props();
</script>

<div>
	{#if data.session}
		<div>
			<p>
				{data.user.name}
			</p>
			<button
				onclick={async () => {
					await authClient.signOut();
				}}
			>
				Sign Out
			</button>
		</div>
	{:else}
		<button
			onclick={async () => {
				await authClient.signIn.social({
					provider: 'google'
				});
			}}
		>
			Continue with google
		</button>
	{/if}
</div>
