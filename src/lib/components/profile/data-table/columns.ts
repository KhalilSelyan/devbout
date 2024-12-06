import type { trpcServer } from '$lib/server/server';
import type { ColumnDef } from '@tanstack/table-core';
import type { inferAsyncReturnType } from '@trpc/server';
import { ethers } from 'ethers';
type UserRequests = inferAsyncReturnType<typeof trpcServer.user.getUserRequests.ssr>;
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';
import DataTableCDateButton from './data-table-cdate-button.svelte';

export const columns: ColumnDef<NonNullable<UserRequests>[number]>[] = [
	{
		accessorKey: 'requestId',
		header: () => {
			const reqIdHeaderSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-left">Request ID</div>`
			}));
			return renderSnippet(reqIdHeaderSnippet, '');
		}
	},
	{
		accessorKey: 'requestData.state',
		header: () => {
			const statusHeaderSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-left">Status</div>`
			}));
			return renderSnippet(statusHeaderSnippet, '');
		},
		cell: ({ row }) => row.original.requestData.state,
		filterFn: (row, columnId, filterValue) => !filterValue || row.getValue(columnId) === filterValue
	},
	{
		accessorKey: 'balance.balance',
		header: () => {
			const amountHeaderSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-left">Paid Amount</div>`
			}));
			return renderSnippet(amountHeaderSnippet, '');
		},
		cell: ({ row }) => {
			const formatter = (val: ethers.BigNumberish) => `${ethers.utils.formatUnits(val)}`;
			const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
				const amount = getAmount();
				return {
					render: () => `<div class="text-left font-medium">${amount}</div>`
				};
			});

			return renderSnippet(
				amountCellSnippet,
				formatter(
					row.original.balance.balance === ''
						? ethers.utils.parseEther('0')
						: row.original.balance.balance
				)
			);
		}
	},
	{
		accessorKey: 'contentData.creationDate',
		header: ({ column }) => {
			return renderComponent(DataTableCDateButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			});
		},
		cell: ({ row }) => new Date(row.original.contentData.creationDate).toLocaleString('en-UK')
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, { id: row.original.requestId });
		}
	}
];
