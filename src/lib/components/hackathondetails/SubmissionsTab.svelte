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
	import { Clock, Github, LinkIcon } from 'lucide-svelte';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import SubmissionDialog from './SubmissionDialog.svelte';

	type Hackathon = Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>;

	let {
		hackathon,
		userHackathons
	}: {
		hackathon: Hackathon;
		userHackathons: Awaited<ReturnType<typeof hackathonService.getUserHackathons>>;
	} = $props();

	let isUserHackathon = userHackathons.some((hackathon) => hackathon.id === hackathon.id);
</script>

{#if hackathon}
	<Card>
		<CardHeader>
			<CardTitle>Project Submissions</CardTitle>
			<CardDescription>Submitted projects for this hackathon</CardDescription>
		</CardHeader>
		<CardContent>
			<ul class="space-y-6">
				{#each hackathon.submissions as submission}
					<li class="rounded-lg border p-4">
						<div class="mb-2 flex items-start justify-between">
							<h3 class="text-lg font-semibold">{submission.projectName}</h3>
							<Badge variant="outline">Team {submission.teamId}</Badge>
						</div>
						<p class="mb-4 text-sm text-gray-600">{submission.description}</p>
						<div class="flex items-center space-x-4 text-sm">
							<div class="flex items-center space-x-1">
								<Clock class="h-4 w-4" />
								<span>{submission.submittedAt.toLocaleString()}</span>
							</div>
							{#if submission.submissionUrl}
								<a
									href={submission.submissionUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center space-x-1 text-blue-600 hover:underline"
								>
									<LinkIcon class="h-4 w-4" />
									<span>View Project</span>
								</a>
							{/if}
							{#if submission.githubUrl}
								<a
									href={submission.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center space-x-1 text-blue-600 hover:underline"
								>
									<Github class="h-4 w-4" />
									<span>GitHub</span>
								</a>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</CardContent>
		<CardFooter>
			{#if isUserHackathon}
				<SubmissionDialog hackathonId={hackathon.id} {userHackathons} />
			{/if}
		</CardFooter>
	</Card>
{/if}
