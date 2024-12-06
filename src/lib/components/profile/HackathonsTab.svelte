<script lang="ts">
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
	import { Label } from '../ui/label';

	let {
		userHackathons
	}: { userHackathons: Awaited<ReturnType<typeof hackathonService.getUserHackathons>> } = $props();
</script>

<!-- Start Generation Here -->
<div class="flex flex-col gap-4">
	<Card>
		<CardHeader>
			<CardTitle>Your Hackathons</CardTitle>
		</CardHeader>
		<CardContent>
			{#if userHackathons && userHackathons.length > 0}
				<ul>
					{#each userHackathons as hackathon}
						<li class="flex items-center gap-2">
							<Label>Hackathon: {hackathon.name} - End Date: {hackathon.endDate}</Label>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No hackathons found.</p>
			{/if}
		</CardContent>
	</Card>
</div>
