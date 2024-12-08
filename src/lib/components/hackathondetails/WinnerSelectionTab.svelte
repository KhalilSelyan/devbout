<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { teamService } from '$lib/server/db/teamService';
	import { toast } from 'svelte-sonner';
	import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
	import { Label } from '../ui/label';
	import { Button } from '../ui/button';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import { trpc } from '$lib/trpc';
	import { HackathonState, switchToTargetNetwork, updateHackathonState } from '$lib/contract';
	import { ethers } from 'ethers';
	import { PUBLIC_CONTRACT_ADDRESS } from '$env/static/public';
	import { contractabi } from '$lib/contractabi';
	import { appKit } from '$lib/appKit';
	import { useWalletState } from '$lib/appKitState.svelte';
	import LoadinOverlay from '../LoadinOverlay.svelte';
	import type { User } from 'better-auth';

	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;
	type Hackathon = Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>;
	let loading = $state(false);
	let currentStep = $state('');
	let progress = $state(0);
	let transactionHash = $state('');

	let {
		teams,
		hackathon,
		setCurrentTab,
		user
	}: {
		teams: Teams;
		hackathon: Hackathon;
		setCurrentTab: (
			tab: 'overview' | 'teams' | 'submissions' | 'contributors' | 'claimPrize' | 'winSelection'
		) => void;
		user: User;
	} = $props();
	let selectedWinningTeam: Teams[number] | null = $state(null);

	let teamAddresses = trpc.team.getTeamMemberWalletAddresses.mutation();
	let announceWinnerMutation = trpc.wallet.announceWinner.mutation();
	const walletState = useWalletState();
	let updateStatusMutation = trpc.hackathon.updateHackathonStatus.mutation();

	const updateHackathonStateInContract = async ({
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

				const mappedState =
					stateMapping[newStatus as Exclude<Exclude<typeof hackathon.status, 'DRAFT'>, 'PAID'>];
				try {
					await updateHackathonState({
						_hackathonId: hackathon.id,
						_newState: mappedState,
						contract
					});

					await $updateStatusMutation.mutateAsync(
						{ hackathonId: hackathon.id, status: 'COMPLETED' },
						{
							onSuccess: () => {
								trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
								trpc.hackathon.getUserHackathons.utils.invalidate(user.id);
								setCurrentTab('overview');
							}
						}
					);
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
	let amountOfSuccesses = $state(0);

	async function confirmSelection() {
		const stateMapping = {
			OPEN: HackathonState.OPEN,
			ONGOING: HackathonState.ONGOING,
			JUDGING: HackathonState.JUDGING,
			COMPLETED: HackathonState.COMPLETED
		};
		if (selectedWinningTeam && hackathon) {
			toast.success(`Winning team confirmed: ${selectedWinningTeam.name}`);

			let selectedTeamAddresses = await $teamAddresses.mutateAsync({
				teamId: selectedWinningTeam.id
			});
			try {
				loading = true;
				currentStep = 'Preparing to announce winners to the smart contract...';
				progress = 10;

				for (const member of selectedTeamAddresses) {
					if (member.user.walletAddress && member.user.walletAddress !== '') {
						currentStep = `Announcing to the smart contract, winner: ${member.user.name}`;
						progress += 10;

						await $announceWinnerMutation.mutateAsync(
							{
								hackathonId: hackathon.id,
								winningParticipantAddress: member.user.walletAddress
							},
							{
								onSuccess: () => {
									toast.success(`Winner ${member.user.name} announced successfully!`);
									amountOfSuccesses++;
								}
							}
						);
					} else {
						toast.warning(
							`${member.user.name} doesn't have their wallet address saved in the db, contact them separately.`
						);
					}
				}

				currentStep = 'Updating Hackathon to Completed State';
				progress = 75;

				await updateHackathonStateInContract({
					hackathon,
					newStatus: 'COMPLETED',
					stateMapping
				});

				currentStep = 'Finalizing...';
				progress = 90;
			} catch (error) {
				console.error('Failed to announce winner:', error);
				toast.error('Failed to announce winner');
			} finally {
				loading = false;
				progress = 100;
			}
		} else {
			toast.error('No team selected');
		}
	}
</script>

{#if teams.length > 0}
	<Card>
		<CardHeader>
			<CardTitle>Winner Selection</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full grid-cols-4 items-center gap-4">
				<Label>Select Winning Team</Label>
				<Select.Root
					type="single"
					name="winningTeam"
					value={selectedWinningTeam?.id}
					onValueChange={(value) => {
						selectedWinningTeam = teams.find((team) => team.id === value) || null;
					}}
				>
					<Select.Trigger class="col-span-3">
						<span>{selectedWinningTeam ? selectedWinningTeam.name : 'Select a team'}</span>
					</Select.Trigger>
					<Select.Content>
						{#each teams as team}
							<Select.Item value={team.id}>{team.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Button class="col-span-4" onclick={() => confirmSelection()}>Confirm</Button>
			</div>
		</CardContent>
	</Card>
{/if}

<LoadinOverlay
	isOpen={loading}
	title="Announcing Winners"
	{currentStep}
	{progress}
	error={null}
	canCancel={progress < 75}
	timeEstimate="30-60 seconds"
	{transactionHash}
/>
