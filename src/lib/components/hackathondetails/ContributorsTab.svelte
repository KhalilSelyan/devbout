<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import { Label } from '../ui/label';

	type Hackathon = Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>;

	let { hackathon }: { hackathon: Hackathon } = $props();
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
								${parseInt(contributor.amount).toLocaleString()}
							</span>
						</li>
					{/each}
				</ul>
			{:else}
				<Label>There have been no contributions to this hackathon.</Label>
			{/if}
		</CardContent>
		<CardFooter>
			<Button variant="outline" class="w-full">Contribute to Prize Pool</Button>
		</CardFooter>
	</Card>
{/if}
