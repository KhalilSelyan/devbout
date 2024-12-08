<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import type { trpcServer } from '$lib/server/server';
	import type { inferAsyncReturnType } from '@trpc/server';
	import { columns } from './data-table/columns';
	import DataTable from './data-table/data-table.svelte';
	type Contributions = inferAsyncReturnType<typeof trpcServer.user.getContributions.ssr>;
	type UserRequests = inferAsyncReturnType<typeof trpcServer.user.getUserRequests.ssr>;

	let {
		userContributions,
		userRequests
	}: { userContributions: Contributions; userRequests: NonNullable<UserRequests> } = $props();
</script>

<div class="flex flex-col gap-4">
	<Card>
		<CardHeader>
			<CardTitle>Your Contributions</CardTitle>
		</CardHeader>
		<CardContent>
			{#if userContributions && userContributions.length > 0}
				<ul class="flex flex-col gap-2">
					{#each userContributions as contribution}
						<li>
							<Card>
								<CardHeader>
									<CardTitle>{contribution.hackathon.name}</CardTitle>
								</CardHeader>
								<CardContent class="flex items-center gap-2">
									<Avatar class="h-10 w-10">
										<AvatarImage
											src={contribution.contributor.image}
											alt={contribution.contributor.name}
										/>
										<AvatarFallback>{contribution.contributor.name.charAt(0)}</AvatarFallback>
									</Avatar>
									<Label>
										You contributed <em>{contribution.amount}</em>
										{contribution.hackathon.paymentType === 'ERC20' ? 'FAU' : 'ETH'} to the hackathon,
										it is well appreciated by all participants.</Label
									>
								</CardContent>
							</Card>
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
