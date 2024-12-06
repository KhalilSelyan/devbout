<script lang="ts" generics="TData, TValue">
	import { Button } from '$lib/components/ui/button';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { data, columns }: DataTableProps<TData, TValue> = $props();
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			}
		}
	});

	const statusFilters = [
		{ value: '', label: 'All' },
		{ value: 'accepted', label: 'Accepted' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'cancelled', label: 'Cancelled' }
	];
	let value = $state('');

	const triggerContent = $derived(
		statusFilters.find((f) => f.value === value)?.label ?? 'Select a Filter'
	);
</script>

<div class="rounded-md border p-4">
	<div class="grid grid-cols-5 items-center gap-2 py-4">
		<Label class="col-span-1" for="status-filter">Filter by Status:</Label>
		<Select
			onValueChange={(val) => {
				table.getColumn('requestData_state')?.setFilterValue(val);
			}}
			type="single"
			name="status-filter"
			bind:value
		>
			<SelectTrigger class="col-span-4">{triggerContent}</SelectTrigger>
			<SelectContent>
				{#each statusFilters as status}
					<SelectItem value={status.value} label={status.label}>
						{status.label}
					</SelectItem>
				{/each}
			</SelectContent>
		</Select>
	</div>
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head>
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#if table.getRowModel().rows.length === 0}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">
						No requests available.
					</Table.Cell>
				</Table.Row>
			{:else if table.getRowModel().rows.length === 1 && (table.getRowModel().rows[0].original as { requestId: string }).requestId === ''}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">
						No requests available.
					</Table.Cell>
				</Table.Row>
			{:else if table.getRowModel().rows.length > 0}
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/if}
		</Table.Body>
	</Table.Root>
	<div class="flex items-center justify-between space-x-4 pt-4">
		<!-- Left side: Pagination Info -->
		<div class="text-sm text-muted-foreground">
			{#if table.getFilteredRowModel().rows.length > 0}
				{Math.min(
					table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
					table.getFilteredRowModel().rows.length
				)}
				/
				{table.getFilteredRowModel().rows.length}
			{:else}
				0/{table.getFilteredRowModel().rows.length}
			{/if}
			Requests
		</div>

		<!-- Right side: Pagination Buttons -->
		<div class="flex items-center space-x-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	</div>
</div>
