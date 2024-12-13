<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { teamService } from '$lib/server/db/teamService';
	import { trpc } from '$lib/trpc';
	import { cn } from '$lib/utils';
	import { teamJoinRequestSchema, teamSchema } from '$lib/zodValidations/teamSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { Label } from './ui/label';
	import { route } from '$lib/ROUTES';
	import { nanoid } from 'nanoid';
	import { joinHackathon, switchToTargetNetwork } from '$lib/contract';
	import { ethers } from 'ethers';
	import { PUBLIC_CONTRACT_ADDRESS } from '$env/static/public';
	import { contractabi } from '$lib/contractabi';
	import { appKit } from '$lib/appKit';
	import { useWalletState } from '$lib/appKitState.svelte';
	import LoadinOverlay from './LoadinOverlay.svelte';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import type { User } from 'better-auth';

	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;
	type Hackathon = NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;

	let { hackathon, teams, user }: { hackathon: Hackathon; teams: Teams; user: User } = $props();

	let isDialogOpen = $state(false);
	let loading = $state(false);
	let currentStep = $state('');
	let progress = $state(0);
	let transactionHash = $state('');

	let teamsloaded = trpc.team.getHackathonTeams.query(hackathon.id, { initialData: teams });
	let teamId = $state(nanoid());
	const walletState = useWalletState();

	let updateWalletInfo = trpc.user.updateWalletAddress.mutation();

	async function addParticipantBeforeCreateJoinTeamInDb({
		_hackathonId
	}: {
		_hackathonId: string;
	}) {
		// if now connected show the rest if not ignore
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

				currentStep = 'Sending transaction...';
				progress = 75;

				await joinHackathon({
					_hackathonId,
					contract
				});
				return true;
			} catch (err) {
				console.error(err);
				return false;
			}
		}
		return true;
	}

	// Create form for new team
	const createTeamForm = superForm(
		{
			id: teamId,
			hackathonId: hackathon.id,
			name: '',
			description: ''
		},
		{
			validators: zod(teamSchema),
			dataType: 'json',
			resetForm: true,
			validationMethod: 'oninput',
			onSubmit: async ({ cancel }) => {
				loading = true;
				const hasGoneThrough = await addParticipantBeforeCreateJoinTeamInDb({
					_hackathonId: hackathon.id
				});

				if (!hasGoneThrough) cancel();

				$updateWalletInfo.mutate({ walletAddress: walletState.address ?? '' });
			},
			onUpdated: ({ form }) => {
				console.log({ form });
				if (form.valid) {
					trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
					trpc.hackathon.getUserHackathons.utils.invalidate(user.id);

					progress = 100;
					loading = false;
					isDialogOpen = false;
				}
			}
		}
	);

	const { form: createForm, enhance: createEnhance, errors: createErrors } = createTeamForm;

	// Form for join request
	const joinRequestForm = superForm(
		{
			teamId: '',
			hackathonId: hackathon.id,
			message: ''
		},
		{
			validators: zod(teamJoinRequestSchema),
			validationMethod: 'oninput',
			dataType: 'json',
			resetForm: true,
			onSubmit: () => {
				loading = true;
			},
			onUpdated: ({ form }) => {
				if (form.valid) {
					loading = false;
					isDialogOpen = false;
					$updateWalletInfo.mutate({ walletAddress: walletState.address ?? '' });
				}
			}
		}
	);

	const { form: joinForm, enhance: joinEnhance, errors: joinErrors } = joinRequestForm;

	function selectTeam(teamId: string) {
		$joinForm.teamId = teamId; // Update the form state here
	}

	let cannotJoin = $derived(['JUDGING', 'COMPLETED', 'PAID'].includes(hackathon.status));
</script>

<Dialog.Root
	controlledOpen
	open={isDialogOpen}
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			createTeamForm.reset();
			joinRequestForm.reset();
			isDialogOpen = false;
		}
	}}
>
	<Dialog.Trigger
		onclick={() => {
			if (!cannotJoin) isDialogOpen = true;
		}}
		class={cn(
			buttonVariants({ variant: 'default' }),
			'w-full',
			cannotJoin && 'cursor-default opacity-50 hover:bg-primary'
		)}
	>
		{#if cannotJoin}
			Cannot join this hackathon anymore
		{:else}
			Join/Create Team
		{/if}
	</Dialog.Trigger>
	<Dialog.Overlay
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (!loading) isDialogOpen = false;
		}}
	/>
	<Dialog.Content class="overflow-y-auto bg-popover sm:max-h-[40rem] sm:max-w-[40rem]">
		<Dialog.Header>
			<Dialog.Title>Team Participation</Dialog.Title>
			<Dialog.Description>Create a new team or join an existing one</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value="create" class="w-full">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="create">Create Team</Tabs.Trigger>
				<Tabs.Trigger value="join">Join Team</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="create" class="mt-4">
				<form
					use:createEnhance
					method="POST"
					action={route('createTeam /hackathons/[id]', { id: hackathon.id })}
					class="flex flex-col gap-4"
				>
					<input type="hidden" name="hackathonId" value={hackathon.id} />
					<input type="hidden" name="id" value={teamId} />

					<div class="flex flex-col gap-2">
						<Label for="teamName">Team Name</Label>
						<Input id="teamName" name="name" bind:value={$createForm.name} />
						{#if $createErrors.name}
							<span class="text-sm text-destructive">{$createErrors.name}</span>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<Label for="teamDescription">Description</Label>
						<Textarea
							id="teamDescription"
							name="description"
							bind:value={$createForm.description}
							placeholder="Describe your team and what you're looking for..."
						/>
						{#if $createErrors.description}
							<span class="text-sm text-destructive">{$createErrors.description}</span>
						{/if}
					</div>

					<div class="flex justify-end gap-2">
						<Button
							type="button"
							disabled={loading}
							variant="ghost"
							onclick={() => {
								isDialogOpen = false;
							}}
						>
							Cancel
						</Button>
						<Button
							disabled={loading || !!$createErrors.description || !!$createErrors.name}
							type="submit"
						>
							Create Team
						</Button>
					</div>
				</form>
			</Tabs.Content>

			<Tabs.Content value="join" class="mt-4">
				{#if $teamsloaded.data?.length === 0 || !$teamsloaded.data}
					<div class="text-center text-muted-foreground">No teams available to join</div>
				{:else}
					<form
						use:joinEnhance
						method="POST"
						action={route('joinTeam /hackathons/[id]', { id: hackathon.id })}
						class="flex flex-col gap-4"
					>
						<div class="flex flex-col gap-4">
							{#each $teamsloaded.data as team (team.id)}
								<div class="rounded-lg border p-4">
									<h4 class="font-medium">{team.name}</h4>
									<p class="text-sm text-muted-foreground">{team.description}</p>
									<div class="mt-2 text-sm">
										Members: {team.members.length}
									</div>
									<Button
										type="button"
										class="mt-2"
										onclick={() => selectTeam(team.id)}
										variant={$joinForm.teamId === team.id ? 'default' : 'outline'}
										>Select Team</Button
									>
								</div>
							{/each}
						</div>

						{#if $joinForm.teamId}
							<div class="flex flex-col gap-2">
								<Label for="joinMessage">Message</Label>
								<Textarea
									id="joinMessage"
									name="message"
									bind:value={$joinForm.message}
									placeholder="Introduce yourself to the team..."
								/>
								{#if $joinErrors.message}
									<Label class="text-destructive">
										{$joinErrors.message}
									</Label>
								{/if}
							</div>
						{/if}

						<input type="hidden" name="hackathonId" value={hackathon.id} />

						<div class="flex justify-end gap-2">
							<Button
								disabled={loading}
								type="button"
								variant="ghost"
								onclick={() => {
									isDialogOpen = false;
								}}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!$joinForm.teamId ||
									!$joinForm.message ||
									!!$joinErrors.message ||
									!!$joinErrors.teamId ||
									loading}
							>
								Request to Join
							</Button>
						</div>
					</form>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>

<LoadinOverlay
	isOpen={loading}
	title="Joining Team"
	{currentStep}
	{progress}
	error={null}
	canCancel={progress < 75}
	timeEstimate="30-60 seconds"
	{transactionHash}
/>
