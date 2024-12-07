<script lang="ts">
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
	import { Label } from '../ui/label';

	let {
		userHackathons
	}: { userHackathons: Awaited<ReturnType<typeof hackathonService.getUserHackathons>> } = $props();
</script>

<Card>
	<CardContent class="max-h-[60dvh] overflow-auto">
		{#if userHackathons && userHackathons.length > 0}
			<div class="flex flex-col gap-4">
				{#each userHackathons as hackathon}
					<Card class="shadow-xl">
						<CardHeader>
							<CardTitle>
								<Label class="text-2xl font-semibold">Hackathon: {hackathon.name}</Label>
							</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-col gap-2">
							<Label>
								<strong>End Date:</strong>
								{new Date(hackathon.endDate).toLocaleString('en-uk', {
									dateStyle: 'full'
								})}
							</Label>
							<Label><strong>Prize Money:</strong> ETH {hackathon.basePrize}</Label>
							<Label>
								<strong>Winning Team:</strong>
								{hackathon.teams.find((team) => team.isWinner)?.name ?? 'No Winner yet'}
							</Label>
						</CardContent>
					</Card>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500">No hackathons found.</p>
		{/if}
	</CardContent>
</Card>
