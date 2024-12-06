<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { createSvelteTable } from '$lib/components/ui/data-table';
	import { Label } from '$lib/components/ui/label';
	import type { trpcServer } from '$lib/server/server';
	import {
		type ColumnFiltersState,
		type PaginationState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import type { inferAsyncReturnType } from '@trpc/server';
	import { columns } from './data-table/columns';
	import DataTable from './data-table/data-table.svelte';
	type Contributions = inferAsyncReturnType<typeof trpcServer.user.getContributions.ssr>;
	type UserRequests = inferAsyncReturnType<typeof trpcServer.user.getUserRequests.ssr>;

	let {
		userContributions,
		userRequests
	}: { userContributions: Contributions; userRequests: NonNullable<UserRequests> } = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });
	let columnFilters = $state<ColumnFiltersState>([]);
	const table = createSvelteTable({
		get data() {
			return userRequests;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) =>
			(pagination = typeof updater === 'function' ? updater(pagination) : updater),
		onColumnFiltersChange: (updater) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
		}
	});
</script>

<div class="flex flex-col gap-4">
	<Card>
		<CardHeader>
			<CardTitle>Your Contributions</CardTitle>
		</CardHeader>
		<CardContent>
			{#if userContributions && userContributions.length > 0}
				<ul>
					{#each userContributions as contribution}
						<li class="flex items-center gap-2">
							<Avatar class="h-10 w-10">
								<AvatarImage
									src={contribution.contributor.image}
									alt={contribution.contributor.name}
								/>
								<AvatarFallback>{contribution.contributor.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<Label>Hackathon: {contribution.hackathon.name} - {contribution.amount} ETH</Label>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No contributions found.</p>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader><CardTitle>Your Requests</CardTitle></CardHeader>
		<CardContent>
			{#if userRequests && userRequests.length > 0}
				<DataTable data={userRequests} {columns} />
			{:else}
				<p>No requests found.</p>
			{/if}
		</CardContent>
	</Card>
</div>
