<script lang="ts">
	import { Calendar, DollarSign, Users, ChevronRight } from 'lucide-svelte';
	import { Button } from './ui/button';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from './ui/badge';
	import { Card, CardContent, CardHeader } from './ui/card';
	// Writable stores for search term and status filter
	let searchTerm = $state('');
	let statusFilter = $state<'DRAFT' | 'OPEN' | 'ONGOING' | 'COMPLETED' | 'ALL'>('ALL');
	type Hackathon = {
		id: string;
		name: string;
		description: string;
		startDate: Date;
		endDate: Date;
		minTeamSize: number;
		maxTeamSize: number;
		prizePool: string;
		basePrize: string;
		fundingType: 'FULLY_FUNDED' | 'CROWDFUNDED' | 'HYBRID';
		status: 'DRAFT' | 'OPEN' | 'ONGOING' | 'COMPLETED';
	};
	// Mock hackathon data
	let mockHackathons: Hackathon[] = $state([
		{
			id: '1',
			name: 'AI for Good Hackathon',
			description: 'Develop AI solutions to address global challenges.',
			startDate: new Date('2024-06-01'),
			endDate: new Date('2024-06-03'),
			minTeamSize: 2,
			maxTeamSize: 5,
			prizePool: '10000',
			basePrize: '5000',
			fundingType: 'HYBRID',
			status: 'DRAFT'
		},
		{
			id: '2',
			name: 'Blockchain Revolution',
			description: 'Create innovative blockchain applications for real-world use cases.',
			startDate: new Date('2024-07-15'),
			endDate: new Date('2024-07-17'),
			minTeamSize: 1,
			maxTeamSize: 4,
			prizePool: '15000',
			basePrize: '7500',
			fundingType: 'CROWDFUNDED',
			status: 'OPEN'
		},
		{
			id: '3',
			name: 'Green Tech Challenge',
			description: 'Develop sustainable technology solutions for a greener future.',
			startDate: new Date('2024-08-10'),
			endDate: new Date('2024-08-12'),
			minTeamSize: 2,
			maxTeamSize: 6,
			prizePool: '20000',
			basePrize: '10000',
			fundingType: 'FULLY_FUNDED',
			status: 'OPEN'
		}
	]);

	// Filtered hackathons based on search and status
	let filteredHackathons = $state([...mockHackathons]);

	// Update filtered hackathons whenever searchTerm or statusFilter changes
	function updateFilters() {
		let term = searchTerm.toLowerCase();
		let status = statusFilter;

		filteredHackathons = mockHackathons.filter(
			(hackathon) =>
				hackathon.name.toLowerCase().includes(term) &&
				(status === 'ALL' || hackathon.status === status)
		);
	}

	$effect(() => {
		updateFilters();
	});
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<h1 class="text-3xl font-bold text-gray-900">Explore Hackathons</h1>
		</div>
	</header>
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
			<!-- Search Input -->
			<input
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				placeholder="Search hackathons..."
				bind:value={searchTerm}
			/>

			<!-- Status Filter -->
			<Select.Root type="single" name="statusFilter" bind:value={statusFilter}>
				<Select.Trigger class="w-[180px]">
					{statusFilter}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.GroupHeading>Status</Select.GroupHeading>
						{#each ['ALL', 'DRAFT', 'OPEN', 'ONGOING', 'COMPLETED'] as status}
							<Select.Item value={status} label={status}>{status}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Hackathon Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredHackathons as hackathon}
				{@render HackathonCard({ hackathon })}
			{/each}
		</div>
	</main>
</div>

{#snippet HackathonCard({ hackathon }: { hackathon: Hackathon })}
	<Card class="overflow-hidden bg-white shadow">
		<CardHeader class="border-b p-4">
			<h2 class="text-xl font-bold">{hackathon.name}</h2>
			<p class="text-gray-600">{hackathon.description}</p>
		</CardHeader>
		<CardContent class="p-4">
			<div class="mb-4 flex items-center justify-between">
				<Badge class=" bg-blue-100 px-2 py-1 text-sm text-blue-800">
					{hackathon.status}
				</Badge>
				<Badge class=" border px-2 py-1 text-sm">
					{hackathon.fundingType}
				</Badge>
			</div>
			<div class="space-y-2">
				<div class="flex items-center">
					<Calendar class="mr-2 h-4 w-4" />
					<span class="text-sm">
						{hackathon.startDate.toLocaleDateString()} - {hackathon.endDate.toLocaleDateString()}
					</span>
				</div>
				<div class="flex items-center">
					<Users class="mr-2 h-4 w-4" />
					<span class="text-sm">
						Team Size: {hackathon.minTeamSize} - {hackathon.maxTeamSize}
					</span>
				</div>
				<div class="flex items-center">
					<DollarSign class="mr-2 h-4 w-4" />
					<span class="text-sm">
						Prize Pool: ${parseInt(hackathon.prizePool).toLocaleString()}
					</span>
				</div>
			</div>
		</CardContent>
		<div class="flex justify-between border-t p-4">
			<Button class=" border px-4 py-2">View Details</Button>
			<Button class="flex items-center px-4 py-2 ">
				Join Hackathon
				<ChevronRight class="ml-2 h-4 w-4" />
			</Button>
		</div>
	</Card>
{/snippet}
