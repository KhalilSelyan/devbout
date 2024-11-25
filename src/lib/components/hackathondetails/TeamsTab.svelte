<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import type { teamService } from '$lib/server/db/teamService';
	import TeamDialog from '../TeamDialog.svelte';

	type Hackathon = NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;
	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;

	let { hackathon, teams }: { hackathon: Hackathon; teams: Teams } = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>Participating Teams</CardTitle>
		<CardDescription>Teams competing in this hackathon</CardDescription>
	</CardHeader>
	<CardContent>
		<ul class="space-y-4">
			{#each hackathon.teams as team}
				<li class="rounded-lg border p-4">
					<div class="mb-2 flex items-center justify-between">
						<h3 class="text-lg font-semibold">{team.name}</h3>
						<Badge variant="secondary">{team.members.length} members</Badge>
					</div>
					<p class="mb-2 text-sm text-gray-500">
						Members: {team.members.map((member) => member.user.name).join(', ')}
					</p>
				</li>
			{/each}
		</ul>
	</CardContent>
	<CardFooter class="w-full">
		<TeamDialog {teams} hackathonId={hackathon.id} />
	</CardFooter>
</Card>
