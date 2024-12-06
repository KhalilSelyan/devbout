<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import type { teamService } from '$lib/server/db/teamService';
	import { trpc } from '$lib/trpc';
	import type { User } from 'better-auth';
	import ContributorsTab from './hackathondetails/ContributorsTab.svelte';
	import OverviewTab from './hackathondetails/OverviewTab.svelte';
	import SubmissionsTab from './hackathondetails/SubmissionsTab.svelte';
	import TeamsTab from './hackathondetails/TeamsTab.svelte';
	import WinnerSelectionTab from './hackathondetails/WinnerSelectionTab.svelte';
	import ClaimPrizeTab from './hackathondetails/ClaimPrizeTab.svelte';

	type Hackathon = NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;
	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;

	let {
		user,
		hackathon,
		teams,
		userHackathons
	}: {
		user: User | undefined;
		hackathon: Hackathon;
		teams: Teams;
		userHackathons: Awaited<ReturnType<typeof hackathonService.getUserHackathons>>;
	} = $props();

	let hackathonQuery = trpc.hackathon.getHackathonDetails.query(
		{ hackathonId: hackathon.id },
		{ initialData: hackathon }
	);

	let currentTab = $state('overview');

	const setCurrentTab = (tab: string) => {
		if (['overview', 'teams', 'submissions', 'contributors'].includes(tab)) currentTab = tab;
	};

	let isOrganizer = $state(user?.id === $hackathonQuery.data?.organizerId);
	let isJudgingPhase = $state($hackathonQuery.data?.status === 'JUDGING');
	let isHackathonCompleted = $state($hackathonQuery.data?.status === 'COMPLETED');
	let isMemberOfWinningTeam = $state(
		user &&
			teams.find(
				(team) => team.isWinner && team.members.find((member) => member.userId === user.id)
			)
	);
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<h1 class="text-3xl font-bold text-gray-900">{$hackathonQuery.data?.name}</h1>
			<div class="mt-2 flex items-center space-x-2">
				<Badge variant={$hackathonQuery.data?.status === 'ONGOING' ? 'default' : 'secondary'}>
					{$hackathonQuery.data?.status}
				</Badge>
				<Badge variant="outline">{$hackathonQuery.data?.fundingType}</Badge>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<Tabs value={currentTab} onValueChange={setCurrentTab}>
			<TabsList class="flex w-full items-center justify-between">
				<TabsTrigger class="w-full" value="overview">Overview</TabsTrigger>
				<TabsTrigger class="w-full" value="contributors">Contributors</TabsTrigger>
				<TabsTrigger class="w-full" value="teams">Teams</TabsTrigger>
				<TabsTrigger class="w-full" value="submissions">Submissions</TabsTrigger>
				{#if isOrganizer && isJudgingPhase}
					<TabsTrigger class="w-full" value="winSelection">Winner Selection</TabsTrigger>
				{/if}
				{#if isMemberOfWinningTeam && isHackathonCompleted}
					<TabsTrigger class="w-full" value="claimPrize">Claim Prize</TabsTrigger>
				{/if}
			</TabsList>
			<TabsContent value="overview">
				<OverviewTab {user} hackathon={$hackathonQuery.data} {setCurrentTab} />
			</TabsContent>
			<TabsContent value="contributors">
				<ContributorsTab hackathon={$hackathonQuery.data} />
			</TabsContent>
			<TabsContent value="teams">
				<TeamsTab hackathon={$hackathonQuery.data} {teams} {user} />
			</TabsContent>
			<TabsContent value="submissions">
				<SubmissionsTab hackathon={$hackathonQuery.data} {userHackathons} />
			</TabsContent>
			{#if isOrganizer && isJudgingPhase}
				<TabsContent value="winSelection">
					<WinnerSelectionTab {teams} hackathon={$hackathonQuery.data} />
				</TabsContent>
			{/if}
			{#if isMemberOfWinningTeam && isHackathonCompleted && user && $hackathonQuery.data}
				<TabsContent value="claimPrize">
					<ClaimPrizeTab {user} hackathon={$hackathonQuery.data} />
				</TabsContent>
			{/if}
		</Tabs>
	</main>
</div>
