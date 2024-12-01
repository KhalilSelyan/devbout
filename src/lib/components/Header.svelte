<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { route } from '$lib/ROUTES';
	import { cn } from '$lib/utils.js';
	import type { User } from 'better-auth';
	import { LucideDoorOpen, LucideUser } from 'lucide-svelte';
	import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
	import { appKit } from '$lib/appKit';
	import { formatAddress } from '$lib/rn-utils/formatAddress';
	import { Badge } from './ui/badge';

	let { user }: { user: User | undefined } = $props();

	const isWalletConnected = $state(appKit.getIsConnectedState());
	const walletInfo = $state(appKit.getWalletInfo());
	const address = $state(appKit.getAddress());
</script>

<header class="container mx-auto flex items-center justify-between py-6">
	<a href={route('/')} class="text-2xl font-bold">DevBout</a>
	<nav class="flex items-center gap-2">
		<Button href={route('/about')} variant="ghost">About</Button>
		<Button href={route('/hackathons')} variant="ghost">Hackathons</Button>
		<Button variant="ghost">Leaderboard</Button>

		{#if user}
			{#if isWalletConnected}
				<Badge onclick={() => appKit.open()} class="flex cursor-pointer items-center gap-2 p-2">
					<img class="size-4" src={walletInfo?.icon} alt="walleticon" />
					<span>
						{address ? formatAddress(address) : 'Error fetching address'}
					</span>
				</Badge>
			{:else}
				<Badge class="cursor-pointer p-2" onclick={() => appKit.open()}>Connect wallet</Badge>
			{/if}

			<Popover.Root>
				<Popover.Trigger>
					<Avatar>
						<AvatarImage src={`${user.image}`} alt="@ks" />
						<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
					</Avatar>
				</Popover.Trigger>
				<Popover.Content align="end" class={cn('rounded-md bg-white p-4 shadow-md')}>
					<div class="flex w-full flex-col items-start gap-2">
						<p class="font-semibold">{user.name}</p>
						<p class="text-sm text-muted-foreground">{user.email}</p>
						<div class="flex w-full flex-col items-end gap-2">
							<Popover.Close>
								<Button href={route('/profile')} variant="outline">
									<LucideUser />
									Profile
								</Button>
							</Popover.Close>

							<Popover.Close>
								<Button
									variant="outline"
									onclick={async () => {
										await authClient.signOut();
										location.reload();
									}}
								>
									<LucideDoorOpen />
									Sign Out
								</Button>
							</Popover.Close>
						</div>
					</div>
				</Popover.Content>
			</Popover.Root>
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
