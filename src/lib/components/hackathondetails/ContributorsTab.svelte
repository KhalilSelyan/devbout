<script lang="ts">
	import { PUBLIC_CONTRACT_ADDRESS } from '$env/static/public';
	import { useWalletState } from '$lib/appKitState.svelte';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import LoadinOverlay from '../LoadinOverlay.svelte';
	import { Label } from '../ui/label';
	import ContributionDialog from './ContributionDialog.svelte';

	type Hackathon = Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>;

	let { hackathon }: { hackathon: Hackathon } = $props();

	const walletState = useWalletState();

	let loading = $state(false);
	let setLoading = (value: boolean) => {
		loading = value;
	};

	let currentStep = $state('');
	let setCurrentStep = (value: string) => {
		currentStep = value;
	};

	let progress = $state(0);
	let setProgress = (value: number) => {
		progress = value;
	};

	let transactionHash = $state('');
	let setTransactionHash = (value: string) => {
		transactionHash = value;
	};
</script>

{#if hackathon}
	<Card>
		<CardHeader>
			<CardTitle>Top Contributors</CardTitle>
			<CardDescription>Recognizing those who have contributed to the prize pool</CardDescription>
		</CardHeader>
		<CardContent>
			{#if hackathon.prizeContributions.length > 0}
				<ul class="space-y-4">
					{#each hackathon.prizeContributions as contributor}
						<li class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<Avatar>
									<AvatarImage
										src={contributor.contributor.image}
										alt={contributor.contributor.name}
									/>
									<AvatarFallback>{contributor.contributor.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div>
									<p class="font-semibold">{contributor.userId}</p>
									<!-- <div class="flex space-x-1">
								{#each contributor.contributor.badges as badge}
									<Badge variant="secondary">
										{badge}
									</Badge>
								{/each}
							</div> -->
								</div>
							</div>
							<span class="font-bold">
								{contributor.amount} ETH
							</span>
						</li>
					{/each}
				</ul>
			{:else}
				<Label>There have been no contributions to this hackathon.</Label>
			{/if}
		</CardContent>
		<CardFooter>
			{#if walletState.address}
				<ContributionDialog
					hackathonId={hackathon.id}
					platformAddress={PUBLIC_CONTRACT_ADDRESS}
					userWalletAddress={walletState.address}
					{setLoading}
					{setCurrentStep}
					{setProgress}
					{setTransactionHash}
				/>
			{:else}
				Connect your wallet
			{/if}
		</CardFooter>
	</Card>
{/if}

<LoadinOverlay
	isOpen={loading}
	title="Creating Hackathon"
	{currentStep}
	{progress}
	error={null}
	canCancel={progress < 75}
	timeEstimate="30-60 seconds"
	{transactionHash}
/>
