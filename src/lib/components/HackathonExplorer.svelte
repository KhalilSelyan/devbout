<script lang="ts">
	import { Calendar, DollarSign, Users, ChevronRight } from 'lucide-svelte';
	import { Button } from './ui/button';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from './ui/badge';
	import { Card, CardContent, CardHeader } from './ui/card';
	import { route } from '$lib/ROUTES';
	import type { hackathon } from '$lib/server/db/schema';
	import CreateHackathon from './CreateHackathon.svelte';
	import type { hackathonSchema } from '$lib/zodValidations/hackathonSchema';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { trpc } from '$lib/trpc';
	import type { trpcServer } from '$lib/server/server';
	import type { inferAsyncReturnType } from '@trpc/server';

	let {
		data
	}: {
		data: {
			hacks: inferAsyncReturnType<typeof trpcServer.hackathon.getHackathons.ssr>;
			form: SuperValidated<Infer<typeof hackathonSchema>>;
		};
	} = $props();

	let searchTerm = $state('');
	let statusFilter = $state<'OPEN' | 'ONGOING' | 'COMPLETED' | 'ALL'>('ALL');

	let hacks = trpc.hackathon.getHackathons.query(undefined, {
		initialData: data.hacks,
		queryHash: 'hackathon'
	});

	// Filtered hackathons based on search and status
	let filteredHackathons = $state($hacks.data ?? []);
	// Update filtered hackathons whenever searchTerm or statusFilter changes
	function updateFilters() {
		let term = searchTerm.toLowerCase();
		let status = statusFilter;

		filteredHackathons = ($hacks.data ?? []).filter(
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
						{#each ['ALL', 'OPEN', 'ONGOING', 'COMPLETED'] as status}
							<Select.Item value={status} label={status}>{status}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<CreateHackathon data={data.form} />
		</div>

		<!-- Hackathon Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredHackathons as hackathon}
				{@render HackathonCard({ singlehackathon: hackathon })}
			{/each}
		</div>
	</main>
</div>

{#snippet HackathonCard({ singlehackathon }: { singlehackathon: typeof hackathon.$inferSelect })}
	<Card class="overflow-hidden bg-white shadow">
		<CardHeader class="border-b p-4">
			<h2 class="text-xl font-bold">{singlehackathon.name}</h2>
			<p class="text-gray-600">{singlehackathon.description}</p>
		</CardHeader>
		<CardContent class="p-4">
			<div class="mb-4 flex items-center justify-between">
				<Badge class=" bg-blue-100 px-2 py-1 text-sm text-blue-800">
					{singlehackathon.status}
				</Badge>
				<Badge class=" border px-2 py-1 text-sm">
					{singlehackathon.fundingType}
				</Badge>
			</div>
			<div class="space-y-2">
				<div class="flex items-center">
					<Calendar class="mr-2 h-4 w-4" />
					<span class="text-sm">
						{singlehackathon.startDate.toLocaleDateString()} - {singlehackathon.endDate.toLocaleDateString()}
					</span>
				</div>
				<div class="flex items-center">
					<Users class="mr-2 h-4 w-4" />
					<span class="text-sm">
						Team Size: {singlehackathon.minTeamSize} - {singlehackathon.maxTeamSize}
					</span>
				</div>
				<div class="flex items-center">
					<DollarSign class="mr-2 h-4 w-4" />
					<span class="text-sm">
						Prize Pool: {singlehackathon.prizePool ?? 'Undefined'}
						{singlehackathon.paymentType === 'ERC20' ? 'FAU' : 'ETH'}
					</span>
				</div>
			</div>
		</CardContent>
		<div class="flex justify-between border-t p-4">
			<Button
				href={route('/hackathons/[id]', {
					id: singlehackathon.id
				})}
				class="w-full border px-4 py-2"
			>
				View Details/Join Hackathon
			</Button>
		</div>
	</Card>
{/snippet}
