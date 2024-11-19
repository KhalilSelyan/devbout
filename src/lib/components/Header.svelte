<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth-client';
	import type { User, Session } from 'better-auth';

	let { session, user }: { session: Session | undefined; user: User | undefined } = $props();
</script>

<header class="container mx-auto flex items-center justify-between py-6">
	<h1 class="text-2xl font-bold">DevBout</h1>
	<nav class="space-x-4">
		<Button variant="ghost">About</Button>
		<Button variant="ghost">Hackathons</Button>
		<Button variant="ghost">Leaderboard</Button>

		{#if session}
			<Button
				variant="outline"
				onclick={async () => {
					await authClient.signOut();
				}}
			>
				Sign Out
			</Button>
		{:else}
			<Button
				onclick={async () => {
					await authClient.signIn.social({
						provider: 'google'
					});
				}}
				variant="outline">Sign In</Button
			>
		{/if}
	</nav>
</header>
