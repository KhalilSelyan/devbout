<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
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

	type Hackathon = NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;

	export let hackathon: Hackathon;
</script>

<Card>
	<CardHeader>
		<CardTitle>Top Contributors</CardTitle>
		<CardDescription>Recognizing those who have contributed to the prize pool</CardDescription>
	</CardHeader>
	<CardContent>
		<ul class="space-y-4">
			{#each hackathon.prizeContributions as contributor}
				<li class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<Avatar>
							<AvatarImage src={contributor.contributor.image} alt={contributor.contributor.name} />
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
	</CardContent>
	<CardFooter>
		<Button variant="outline" class="w-full">Contribute to Prize Pool</Button>
	</CardFooter>
</Card>
