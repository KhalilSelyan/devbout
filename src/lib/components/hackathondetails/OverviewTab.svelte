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
	import {
		createHackathon,
		HackathonState,
		switchToTargetNetwork,
		updateHackathonState
	} from '$lib/contract';
	import { useWalletState } from '$lib/appKitState.svelte';
	import { appKit } from '$lib/appKit';
	import { ethers } from 'ethers';
	import { PUBLIC_CONTRACT_ADDRESS, PUBLIC_PLATFORM_WALLET_ADDRESS } from '$env/static/public';
	import { contractabi } from '$lib/contractabi';
	import { handleRequestPayment, prepareRequestParameters } from '$lib/rn-utils/req';
	import LoadinOverlay from '../LoadinOverlay.svelte';

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

	const walletState = useWalletState();
	let loading = $state(false);
	let currentStep = $state('');
	let progress = $state(0);
	let transactionHash = $state('');
	let title = $state('');

	let updateStatusMutation = trpc.hackathon.updateHackathonStatus.mutation();
	let hackathonSubmissions = trpc.submission.getSubmissionsByHackathonId.mutation();
	const isHackathonCreator = $derived.by(() => {
		if (hackathon) return hackathon.organizer.id === user?.id;
	});

	let createHackathonMutation = trpc.wallet.createHackathonThroughPlatformWallet.mutation();

	async function addHackathonToContract({
		_hackathonId,
		_isCrowdfunded,
		basePrize
	}: {
		_hackathonId: string;
		_isCrowdfunded: boolean;
		basePrize: string;
	}) {
		loading = true;
		// If not connected open the modal to connect
		if (!appKit.getIsConnectedState()) {
			await appKit.open();
		}

		// if now connected show the rest if not ignore
		if (appKit.getIsConnectedState()) {
			currentStep = 'Connecting to wallet...';
			progress = 25;
			const provider = appKit.getWalletProvider();

			if (!provider) {
				console.error('Wallet provider is not available.');
				loading = false;
				return false;
			}

			try {
				// Initialize ethers.js provider
				const ethersProvider = new ethers.providers.Web3Provider(provider);

				// Ensure correct network
				currentStep = 'Switching to correct network...';
				progress = 50;
				await switchToTargetNetwork(ethersProvider, 'eth');

				const reqParams = prepareRequestParameters({
					amountInCrypto: parseFloat(basePrize),
					builderId: 'DevBout',
					contributorInfo: {
						address: undefined,
						businessName: 'KhalilSelyan',
						companyRegistration: 'KhalilSelyan',
						email: 'khalil@leodrive.ai',
						firstName: 'Khalil',
						lastName: 'Selyan',
						phone: '',
						taxRegistration: ''
					},
					createdWith: 'DevBout',
					currency: {
						decimals: 18,
						hash: '',
						id: '',
						network: 'sepolia',
						symbol: 'ETH',
						type: 'ETH',
						address: 'eth',
						name: 'sepolia'
					},
					feeAddress: '0x0000000000000000000000000000000000000000',
					feeAmountInCrypto: 0,
					payerAddress: appKit.getAddress()!,
					platformAddress: PUBLIC_PLATFORM_WALLET_ADDRESS,
					platformInfo: {
						address: undefined,
						businessName: 'DevBout',
						companyRegistration: 'DevBout',
						email: 'khalilselyan@gmail.com',
						firstName: 'Dev',
						lastName: 'Bout',
						logo: '',
						name: 'DevBout',
						phone: '',
						taxRegistration: ''
					},
					totalAmountInCrypto: parseFloat(basePrize)
				});

				currentStep = 'Sending transaction...';
				progress = 75;

				const reshandle = await handleRequestPayment({
					payerAddress: appKit.getAddress()!,
					persistRequest: true,
					walletProvider: provider,
					requestParameters: reqParams
				});

				console.log({ requestId: reshandle.requestId });
				currentStep = 'Waiting for confirmation...';
				progress = 90;

				transactionHash = reshandle.inMemoryInfo?.transactionData.hash ?? '';
				const contract = new ethers.Contract(
					PUBLIC_CONTRACT_ADDRESS,
					contractabi,
					ethersProvider!.getSigner()
				);

				await createHackathon({
					_hackathonId,
					_isCrowdfunded,
					basePrize,
					contract
				});

				return true;
			} catch (err) {
				console.error(err);
				loading = false;
				return false;
			}
		}
		return true;
	}

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
		loading = true;
		title = 'Updating Hackathon State';
		if (walletState.isWalletConnected) {
			currentStep = 'Connecting to wallet...';
			progress = 25;
			const provider = appKit.getWalletProvider();

			if (!provider) {
				console.error('Wallet provider is not available.');
				loading = false;
				return false;
			}

			try {
				// Initialize ethers.js provider
				const ethersProvider = new ethers.providers.Web3Provider(provider);

				// Ensure correct network
				currentStep = 'Switching to correct network...';
				progress = 50;
				await switchToTargetNetwork(ethersProvider, 'eth');
				const contract = new ethers.Contract(
					PUBLIC_CONTRACT_ADDRESS,
					contractabi,
					ethersProvider!.getSigner()
				);

				const mappedState =
					stateMapping[newStatus as Exclude<Exclude<typeof hackathon.status, 'DRAFT'>, 'PAID'>];
				try {
					currentStep = 'Sending transaction...';
					progress = 75;
					await updateHackathonState({
						_hackathonId: hackathon.id,
						_newState: mappedState,
						contract
					});
					currentStep = 'Waiting for confirmation...';
					progress = 90;
				} catch (error) {
					console.error(error);
					loading = false;
					return false;
				}

				return true;
			} catch (err) {
				console.error(err);
				loading = false;
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
					{#if hackathon.status === 'DRAFT'}
						<Select.Root
							type="single"
							name="status"
							value={hackathon.status}
							onValueChange={async (value) => {
								const newStatus = value as typeof hackathon.status | '';

								const stateMapping = {
									OPEN: HackathonState.OPEN
								};
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

								const hasGoneThrough = await addHackathonToContract({
									_hackathonId: hackathon.id,
									_isCrowdfunded:
										hackathon.fundingType === 'CROWDFUNDED' || hackathon.fundingType === 'HYBRID'
											? true
											: false,
									basePrize: hackathon.basePrize ?? '0'
								});

								if (!hasGoneThrough) return;

								await $updateStatusMutation.mutateAsync({
									hackathonId: hackathon.id,
									status: newStatus
								});

								currentStep = 'Done...';
								progress = 100;
								trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
								loading = false;
							}}
						>
							<Select.Trigger class="col-span-3">
								<span>{hackathon.status}</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="DRAFT">Draft</Select.Item>
								<Select.Item value="OPEN">Open</Select.Item>
							</Select.Content>
						</Select.Root>
					{:else}
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
								const currentStatusValue =
									stateMapping[
										hackathon.status as Exclude<Exclude<typeof hackathon.status, 'DRAFT'>, 'PAID'>
									];
								const newStatusValue =
									stateMapping[
										newStatus as Exclude<Exclude<typeof hackathon.status, 'DRAFT'>, 'PAID'>
									];
								if (newStatusValue < currentStatusValue) {
									toast.error('Cannot go back to a previous status.');
									return;
								}
								if (newStatus === '') {
									value = hackathon.status;
									return;
								}

								if (
									newStatusValue === HackathonState.JUDGING ||
									newStatusValue === HackathonState.COMPLETED
								) {
									const submissions = await $hackathonSubmissions.mutateAsync(hackathon.id);
									if (submissions.length < 1) {
										value = hackathon.status;
										toast.error('Cannot close hackathon with no submissions');
										return;
									}
								}

								if (
									newStatusValue === HackathonState.COMPLETED &&
									currentStatusValue !== HackathonState.JUDGING
								) {
									value = hackathon.status;
									toast.error('Cannot close hackathon without going through judging phase');
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

								currentStep = 'Done...';
								progress = 100;
								trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
								loading = false;
							}}
						>
							<Select.Trigger class="col-span-3">
								<span>{hackathon.status}</span>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="OPEN">Open</Select.Item>
								<Select.Item value="ONGOING">Ongoing</Select.Item>
								<Select.Item value="JUDGING">Judging</Select.Item>
								<Select.Item value="COMPLETED">Completed</Select.Item>
							</Select.Content>
						</Select.Root>
					{/if}
				</div>
			{/if}
		</CardFooter>
	</Card>
{/if}

<LoadinOverlay
	isOpen={loading}
	{title}
	{currentStep}
	{progress}
	error={null}
	canCancel={progress < 75}
	timeEstimate="30-60 seconds"
	{transactionHash}
/>
