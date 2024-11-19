<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth-client';
	import type { User, Session } from 'better-auth';
	import { route } from '$lib/ROUTES';
	import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

	let { session, user }: { session: Session | undefined; user: User | undefined } = $props();
</script>

<header class="container mx-auto flex items-center justify-between py-6">
	<a href={route('/')} class="text-2xl font-bold">DevBout</a>
	<nav class="flex items-center gap-2">
		<Button variant="ghost">About</Button>
		<Button href={route('/hackathons')} variant="ghost">Hackathons</Button>
		<Button variant="ghost">Leaderboard</Button>

		{#if session}
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					onclick={async () => {
						await authClient.signOut();
						location.reload();
					}}
				>
					Sign Out
				</Button>
				<Avatar>
					<AvatarImage src={`${user?.image}`} alt="@ks" />
					<AvatarFallback>{user?.name}</AvatarFallback>
				</Avatar>
			</div>
		{:else}
			<Button
				onclick={async () => {
					await authClient.signIn.social({
						provider: 'google'
					});
				}}
				variant="outline"
				>Sign In
			</Button>
		{/if}
	</nav>
</header>
