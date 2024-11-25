<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import type { teamService } from '$lib/server/db/teamService';
	import OverviewTab from './hackathondetails/OverviewTab.svelte';
	import ContributorsTab from './hackathondetails/ContributorsTab.svelte';
	import TeamsTab from './hackathondetails/TeamsTab.svelte';
	import SubmissionsTab from './hackathondetails/SubmissionsTab.svelte';
	import type { User } from 'better-auth';
	import { trpc } from '$lib/trpc';

	type Hackathon = NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;
	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;

	let { user, hackathon, teams }: { user: User | undefined; hackathon: Hackathon; teams: Teams } =
		$props();

	let hackathonQuery = trpc.hackathon.getHackathonDetails.query(
		{ hackathonId: hackathon.id },
		{ initialData: hackathon }
	);

	let currentTab = $state('overview');

	const setCurrentTab = (tab: 'overview' | 'teams' | 'submissions' | 'contributors') => {
		currentTab = tab;
	};
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<h1 class="text-3xl font-bold text-gray-900">{$hackathonQuery.data.name}</h1>
			<div class="mt-2 flex items-center space-x-2">
				<Badge variant={$hackathonQuery.data.status === 'ONGOING' ? 'default' : 'secondary'}>
					{$hackathonQuery.data.status}
				</Badge>
				<Badge variant="outline">{$hackathonQuery.data.fundingType}</Badge>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<Tabs value={currentTab} onValueChange={setCurrentTab}>
			<TabsList class="grid w-full grid-cols-4">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="contributors">Contributors</TabsTrigger>
				<TabsTrigger value="teams">Teams</TabsTrigger>
				<TabsTrigger value="submissions">Submissions</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<OverviewTab {user} hackathon={$hackathonQuery.data} {setCurrentTab} />
			</TabsContent>
			<TabsContent value="contributors">
				<ContributorsTab hackathon={$hackathonQuery.data} />
			</TabsContent>
			<TabsContent value="teams">
				<TeamsTab hackathon={$hackathonQuery.data} {teams} />
			</TabsContent>
			<TabsContent value="submissions">
				<SubmissionsTab hackathon={$hackathonQuery.data} />
			</TabsContent>
		</Tabs>
	</main>
</div>
