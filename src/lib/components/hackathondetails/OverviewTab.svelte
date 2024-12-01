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
	import { Calendar, DollarSign, Users } from 'lucide-svelte';
	import { Label } from '../ui/label';
	import { Separator } from '../ui/separator';
	import { toast } from 'svelte-sonner';

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

	let updateStatusMutation = trpc.hackathon.updateHackathonStatus.mutation();
	const isHackathonCreator = $derived.by(() => {
		if (hackathon) return hackathon.organizer.id === user?.id;
	});
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
					<Select.Root
						type="single"
						name="status"
						value={hackathon.status}
						onValueChange={async (value) => {
							const newStatus = value as typeof hackathon.status | '';

							if (hackathon.status !== 'DRAFT' && newStatus === 'DRAFT') {
								return toast.error('Cannot Throw a Hackathon back into draft after publishing it.');
							}
							if (newStatus === '') {
								return (value = hackathon.status);
							}
							await $updateStatusMutation.mutateAsync({
								hackathonId: hackathon.id,
								status: newStatus
							});

							trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
						}}
					>
						<Select.Trigger class="col-span-3">
							<span>{hackathon.status}</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="DRAFT">Draft</Select.Item>
							<Select.Item value="OPEN">Open</Select.Item>
							<Select.Item value="ONGOING">Ongoing</Select.Item>
							<Select.Item value="JUDGING">Judging</Select.Item>
							<Select.Item value="COMPLETED">Completed</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			{/if}
		</CardFooter>
	</Card>
{/if}
