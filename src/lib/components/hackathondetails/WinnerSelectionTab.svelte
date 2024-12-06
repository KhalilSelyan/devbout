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

	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;
	type Hackathon = Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>;

	let { teams, hackathon }: { teams: Teams; hackathon: Hackathon } = $props();
	let selectedWinningTeam: Teams[number] | null = $state(null);

	let teamAddresses = trpc.team.getTeamMemberWalletAddresses.mutation();
	let announceWinnerMutation = trpc.wallet.announceWinners.mutation();
	async function confirmSelection() {
		if (selectedWinningTeam && hackathon) {
			toast.success(`Winning team confirmed: ${selectedWinningTeam.name}`);

			let selectedTeamAddresses = await $teamAddresses.mutateAsync({
				teamId: selectedWinningTeam.id
			});
			let amountOfSuccesses = 0;
			try {
				selectedTeamAddresses.map(async (member) => {
					if (member.user.walletAddress && member.user.walletAddress !== '') {
						await $announceWinnerMutation.mutateAsync({
							hackathonId: hackathon.id,
							winningParticipantAddress: member.user.walletAddress
						});
						toast.success(`Winner ${member.user.name} announced successfully!`);
						amountOfSuccesses++;
					} else {
						toast.warning(
							`${member.user.name} doesn't have his walletAddress saved in the db, contact them separately.`
						);
					}
				});

				// if (amountOfSuccesses === selectedTeamAddresses.length) {
				// 	const provider = appKit.getWalletProvider();
				// 	if (!provider) {
				// 		console.error('Wallet provider is not available.');
				// 		toast.error('Wallet provider is not available.');
				// 		return false;
				// 	}
				// 	const ethersProvider = new ethers.providers.Web3Provider(provider);
				// 	// Ensure correct network
				// 	await switchToTargetNetwork(ethersProvider, 'eth');

				// 	const contract = new ethers.Contract(
				// 		PUBLIC_CONTRACT_ADDRESS,
				// 		contractabi,
				// 		ethersProvider.getSigner()
				// 	);
				// 	await updateHackathonState({
				// 		_hackathonId: hackathon.id,
				// 		_newState: HackathonState.COMPLETED,
				// 		contract
				// 	});
				// }
			} catch (error) {
				console.error('Failed to announce winner:', error);
				toast.error('Failed to announce winner');
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
