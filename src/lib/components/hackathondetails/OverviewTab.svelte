<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import { trpc } from '$lib/trpc';
	import type { User } from 'better-auth';
	import { Calendar, Users } from 'lucide-svelte';
	import { Label } from '../ui/label';
	import { Separator } from '../ui/separator';
	import { toast } from 'svelte-sonner';
	import { HackathonState, switchToTargetNetwork, updateHackathonState } from '$lib/contract';
	import { useWalletState } from '$lib/appKitState.svelte';
	import { appKit } from '$lib/appKit';
	import { ethers } from 'ethers';
	import { PUBLIC_CONTRACT_ADDRESS } from '$env/static/public';
	import { contractabi } from '$lib/contractabi';

	type Hackathon = Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>;

	let {
		user,
		hackathon,
		setCurrentTab
	}: {
		user: User | undefined;
		hackathon: Hackathon;
		setCurrentTab: (tab: 'overview' | 'teams' | 'submissions' | 'contributors') => void;
	} = $props();

	let updateStatusMutation = trpc.hackathon.updateHackathonStatus.mutation();
	const isHackathonCreator = $derived.by(() => {
		if (hackathon) return hackathon.organizer.id === user?.id;
	});

	const walletState = useWalletState();

	const updateHackathonStateInContractBeforeDb = async ({
		hackathon,
		newStatus,
		stateMapping
	}: {
		newStatus: string;
		hackathon: NonNullable<Hackathon>;
		stateMapping: {
			OPEN: HackathonState;
			ONGOING: HackathonState;
			JUDGING: HackathonState;
			COMPLETED: HackathonState;
		};
	}) => {
		if (walletState.isWalletConnected) {
			const provider = appKit.getWalletProvider();

			if (!provider) {
				console.error('Wallet provider is not available.');
				return false;
			}

			try {
				// Initialize ethers.js provider
				const ethersProvider = new ethers.providers.Web3Provider(provider);

				// Ensure correct network
				await switchToTargetNetwork(ethersProvider, 'eth');
				const contract = new ethers.Contract(
					PUBLIC_CONTRACT_ADDRESS,
					contractabi,
					ethersProvider!.getSigner()
				);

				const mappedState = stateMapping[newStatus as Exclude<typeof hackathon.status, 'DRAFT'>];
				try {
					await updateHackathonState({
						_hackathonId: hackathon.id,
						_newState: mappedState,
						contract
					});
				} catch (error) {
					console.error(error);
					return false;
				}

				return true;
			} catch (err) {
				console.error(err);
				return false;
			}
		}
	};
</script>

{#if hackathon}
	<Card>
		<CardHeader>
			<CardTitle>Hackathon Details</CardTitle>
			<CardDescription>{hackathon.description}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<Calendar class="h-5 w-5 text-gray-500" />
					<span>
						{hackathon.startDate.toLocaleDateString('en-uk', { dateStyle: 'long' })} - {hackathon.endDate.toLocaleDateString(
							'en-uk',
							{ dateStyle: 'long' }
						)}
					</span>
				</div>
				<div class="flex items-center space-x-2">
					<Users class="h-5 w-5 text-gray-500" />
					<span>Team Size: {hackathon.minTeamSize} - {hackathon.maxTeamSize}</span>
				</div>
			</div>
			<div>
				<h3 class="mb-2 text-lg font-semibold">Prize Pool</h3>
				<div class="flex items-center space-x-2">
					<span>Eth</span>
					<span class="text-2xl font-bold"> {(hackathon.prizePool ?? '0').toLocaleString()}</span>
				</div>
				<p class="mt-1 text-sm text-gray-500">
					Base Prize: <span>Eth</span>
					{(hackathon.basePrize ?? '0').toLocaleString()}
				</p>
			</div>
			<div>
				<h3 class="mb-2 text-lg font-semibold">Judging Criteria</h3>
				<ul class="space-y-2">
					{#each hackathon.judgingCriteria ?? [] as criterion}
						<li class="flex items-center justify-between">
							<span>{criterion.name}</span>
							<span class="font-semibold">{criterion.weight}%</span>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h3 class="mb-2 text-lg font-semibold">AI-Generated Topics</h3>
				<ul class="list-inside list-disc space-y-1">
					{#each hackathon.aiGeneratedTopics ?? [] as topic}
						<li>{topic}</li>
					{/each}
				</ul>
			</div>
		</CardContent>
		<Separator class="my-4" />
		<CardFooter>
			{#if !isHackathonCreator}
				<Button
					class="w-full"
					onclick={() => {
						setCurrentTab('teams');
					}}
					disabled={['JUDGING', 'COMPLETED'].includes(hackathon.status)}
				>
					{#if ['JUDGING', 'COMPLETED'].includes(hackathon.status)}
						Cannot Join This Hackathon Anymore
					{:else}
						Join Hackathon
					{/if}
				</Button>
			{:else}
				<div class="grid w-full grid-cols-4 items-center gap-2">
					<Label>Update Hackathon Status</Label>
					<Select.Root
						type="single"
						name="status"
						value={hackathon.status}
						onValueChange={async (value) => {
							const newStatus = value as typeof hackathon.status | '';

							const stateMapping = {
								OPEN: HackathonState.OPEN,
								ONGOING: HackathonState.ONGOING,
								JUDGING: HackathonState.JUDGING,
								COMPLETED: HackathonState.COMPLETED
							};
							if (hackathon.status !== 'DRAFT' && newStatus === 'DRAFT') {
								toast.error('Cannot Throw a Hackathon back into draft after publishing it.');
								return;
							}

							const currentStatusValue =
								stateMapping[hackathon.status as Exclude<typeof hackathon.status, 'DRAFT'>];
							const newStatusValue =
								stateMapping[newStatus as Exclude<typeof hackathon.status, 'DRAFT'>];
							if (newStatusValue < currentStatusValue) {
								toast.error('Cannot go back to a previous status.');
								return;
							}
							if (newStatus === '') {
								value = hackathon.status;
								return;
							}
							const hasGoneThrough = await updateHackathonStateInContractBeforeDb({
								hackathon,
								newStatus,
								stateMapping
							});

							if (!hasGoneThrough) return;
							await $updateStatusMutation.mutateAsync({
								hackathonId: hackathon.id,
								status: newStatus
							});

							trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
						}}
					>
						<Select.Trigger class="col-span-3">
							<span>{hackathon.status}</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="DRAFT">Draft</Select.Item>
							<Select.Item value="OPEN">Open</Select.Item>
							<Select.Item value="ONGOING">Ongoing</Select.Item>
							<Select.Item value="JUDGING">Judging</Select.Item>
							<Select.Item value="COMPLETED">Completed</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			{/if}
		</CardFooter>
	</Card>
{/if}
