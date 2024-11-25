<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Calendar, Check, X } from 'lucide-svelte';
	import { trpc } from '$lib/trpc';
	import type { User } from 'better-auth';

	let { user }: { user: User } = $props();
	let userHackathons = trpc.hackathon.getUserHackathons.query(user.id);
	let pendingRequests = trpc.team.getLeaderTeamRequests.query();

	// Mutations
	let joinRequestMutation = trpc.team.handleJoinRequest.mutation();
	let kickMemberMutation = trpc.team.kickMember.mutation();
	let leaveTeamMutation = trpc.team.leaveTeam.mutation();

	// Handle join request
	async function handleJoinRequest(requestId: string, status: 'ACCEPTED' | 'REJECTED') {
		try {
			await $joinRequestMutation.mutateAsync({ requestId, status });
			// Refresh data
			trpc.team.getLeaderTeamRequests.utils.invalidate();
			trpc.hackathon.getUserHackathons.utils.invalidate(user.id);
		} catch (error) {
			console.error('Failed to handle join request:', error);
		}
	}

	// Handle kicking a member
	async function kickMember(teamId: string, memberId: string) {
		try {
			await $kickMemberMutation.mutateAsync({
				teamId,
				userId: memberId
			});
			trpc.hackathon.getUserHackathons.utils.invalidate(user.id);
		} catch (error) {
			console.error('Failed to kick member:', error);
		}
	}

	// Handle leaving a team
	async function leaveTeam(teamId: string) {
		try {
			await $leaveTeamMutation.mutateAsync(teamId);
			trpc.hackathon.getUserHackathons.utils.invalidate(user.id);
		} catch (error) {
			console.error('Failed to leave team:', error);
		}
	}
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	<Card class="md:col-span-2">
		<CardHeader>
			<CardTitle>Your Teams</CardTitle>
		</CardHeader>
		<CardContent>
			{#if $userHackathons.isLoading}
				<div>Loading teams...</div>
			{:else if $userHackathons.data?.length === 0 || !$userHackathons.data}
				<div>No teams found</div>
			{:else}
				<div class="space-y-6">
					{#each $userHackathons.data as hackathon}
						{#each hackathon.teams as team}
							<div class="rounded-lg border p-4">
								<!-- Team header -->
								<div class="mb-4 flex items-center justify-between">
									<div>
										<h3 class="text-lg"><strong>Team Name:</strong> {team.name}</h3>
										<p class="text-sm text-muted-foreground">
											<strong>Hackathon Title:</strong>
											{hackathon.name}
										</p>
									</div>
									<Badge>{hackathon.status}</Badge>
								</div>
								<p class="mb-4 text-sm text-muted-foreground">
									<strong>Team description:</strong>
									{team.description}
								</p>

								<!-- Team members -->
								<div class="space-y-2">
									<h4 class="font-semibold">Team Members:</h4>
									<ul class="space-y-2">
										{#each team.members as member}
											<li class="flex items-center justify-between">
												<div class="flex items-center space-x-2">
													<Avatar class="h-8 w-8">
														<AvatarImage src={member.user.image} alt={member.user.name} />
														<AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<span>{member.user.name}</span>
													{#if member.role === 'LEADER'}
														<Badge variant="secondary">Leader</Badge>
													{/if}
												</div>
												{#if member.role === 'LEADER' && member.userId !== user.id}
													<Button
														variant="destructive"
														size="sm"
														onclick={() => kickMember(team.id, member.userId)}
													>
														Kick
													</Button>
												{/if}
											</li>
										{/each}
									</ul>
								</div>

								<!-- Join requests and team actions -->
								{#if team.members.some((m) => m.userId === user.id && m.role === 'LEADER')}
									<div class="mt-4">
										<h4 class="mb-2 font-medium">Pending Join Requests:</h4>
										{#if $pendingRequests.data?.length}
											<ul class="space-y-2">
												{#each $pendingRequests.data as request}
													<li class="flex items-center justify-between rounded-lg border p-2">
														<div class="flex flex-col gap-2 font-mono text-xs">
															<div class="flex items-center gap-2">
																<p class="text-xs font-medium">{request.user.name} -</p>
																<p class="text-xs font-medium">{request.user.email}</p>
															</div>
															<div class="flex items-center gap-2 text-muted-foreground">
																{#if request.message}
																	<p>Message:</p>
																	<p class="">{request.message}</p>
																{/if}
															</div>
														</div>
														<div class="flex space-x-2">
															<Button
																size="sm"
																variant="default"
																onclick={() => handleJoinRequest(request.id, 'ACCEPTED')}
															>
																<Check class="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onclick={() => handleJoinRequest(request.id, 'REJECTED')}
															>
																<X class="h-4 w-4" />
															</Button>
														</div>
													</li>
												{/each}
											</ul>
										{:else}
											<p class="text-sm text-muted-foreground">No pending requests</p>
										{/if}
									</div>
								{:else}
									<div class="mt-4">
										<Button variant="outline" class="w-full" onclick={() => leaveTeam(team.id)}>
											Leave Team
										</Button>
									</div>
								{/if}
							</div>
						{/each}
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<div class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Active Hackathons</CardTitle>
			</CardHeader>
			<CardContent>
				{#if $userHackathons.data}
					<ul class="space-y-2">
						{#each $userHackathons.data.filter((h) => h.status === 'ONGOING') as hackathon}
							{#each hackathon.teams as team}
								<li class="flex items-center justify-between">
									<div>
										<p class="font-semibold">{hackathon.name}</p>
										<p class="text-sm text-muted-foreground">Team: {team.name}</p>
									</div>
									<Badge variant="outline" class="flex items-center space-x-1">
										<Calendar class="h-4 w-4" />
										<span>Ends {new Date(hackathon.endDate).toLocaleDateString()}</span>
									</Badge>
								</li>
							{/each}
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
