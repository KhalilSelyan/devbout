<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { teamService } from '$lib/server/db/teamService';
	import { trpc } from '$lib/trpc';
	import { cn } from '$lib/utils';
	import { teamJoinRequestSchema, teamSchema } from '$lib/zodValidations/teamSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { Label } from './ui/label';
	import { route } from '$lib/ROUTES';
	type Teams = NonNullable<Awaited<ReturnType<typeof teamService.getHackathonTeams>>>;

	let { hackathonId, teams }: { hackathonId: string; teams: Teams } = $props();

	let isDialogOpen = $state(false);

	let teamsloaded = trpc.team.getHackathonTeams.query(hackathonId, { initialData: teams });
	let loading = $state(false);

	// Create form for new team
	const createTeamForm = superForm(
		{
			id: '',
			hackathonId,
			name: '',
			description: ''
		},
		{
			validators: zod(teamSchema),
			dataType: 'json',
			resetForm: true,
			onUpdated: ({ form }) => {
				if (form.valid) {
					trpc.team.getHackathonTeams.utils.invalidate(hackathonId);
					isDialogOpen = false;
				}
			}
		}
	);

	const { form: createForm, enhance: createEnhance, errors: createErrors } = createTeamForm;

	// Form for join request
	const joinRequestForm = superForm(
		{
			teamId: '',
			message: ''
		},
		{
			validators: zod(teamJoinRequestSchema),
			dataType: 'json',
			resetForm: true,
			onUpdated: ({ form }) => {
				if (form.valid) {
					isDialogOpen = false;
				}
			}
		}
	);

	const { form: joinForm, enhance: joinEnhance, errors: joinErrors } = joinRequestForm;
</script>

<Dialog.Root
	controlledOpen
	open={isDialogOpen}
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			createTeamForm.reset();
			joinRequestForm.reset();
		}
	}}
>
	<Dialog.Trigger
		onclick={() => (isDialogOpen = true)}
		class={cn(buttonVariants({ variant: 'default' }), 'w-full')}>Join/Create Team</Dialog.Trigger
	>
	<Dialog.Overlay
		onclick={() => {
			isDialogOpen = false;
		}}
	/>
	<Dialog.Content class="overflow-y-auto bg-popover sm:max-h-[40rem] sm:max-w-[40rem]">
		<Dialog.Header>
			<Dialog.Title>Team Participation</Dialog.Title>
			<Dialog.Description>Create a new team or join an existing one</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value="create" class="w-full">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="create">Create Team</Tabs.Trigger>
				<Tabs.Trigger value="join">Join Team</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="create" class="mt-4">
				<form
					use:createEnhance
					method="POST"
					action={route('createTeam /hackathons/[id]', { id: hackathonId })}
					class="flex flex-col gap-4"
				>
					<input type="hidden" name="hackathonId" value={hackathonId} />

					<div class="flex flex-col gap-2">
						<Label for="teamName">Team Name</Label>
						<Input id="teamName" name="name" bind:value={$createForm.name} />
						{#if $createErrors.name}
							<span class="text-sm text-destructive">{$createErrors.name}</span>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<Label for="teamDescription">Description</Label>
						<Textarea
							id="teamDescription"
							name="description"
							bind:value={$createForm.description}
							placeholder="Describe your team and what you're looking for..."
						/>
						{#if $createErrors.description}
							<span class="text-sm text-destructive">{$createErrors.description}</span>
						{/if}
					</div>

					<div class="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							onclick={() => {
								isDialogOpen = false;
							}}>Cancel</Button
						>
						<Button type="submit">Create Team</Button>
					</div>
				</form>
			</Tabs.Content>

			<Tabs.Content value="join" class="mt-4">
				{#if loading}
					<div class="flex justify-center">Loading teams...</div>
				{:else if $teamsloaded.data?.length === 0 || !$teamsloaded.data}
					<div class="text-center text-muted-foreground">No teams available to join</div>
				{:else}
					<form
						use:joinEnhance
						method="POST"
						action={route('joinTeam /hackathons/[id]', { id: hackathonId })}
						class="flex flex-col gap-4"
					>
						<div class="flex flex-col gap-4">
							{#each $teamsloaded.data as team (team.id)}
								<div class="rounded-lg border p-4">
									<h4 class="font-medium">{team.name}</h4>
									<p class="text-sm text-muted-foreground">{team.description}</p>
									<div class="mt-2 text-sm">
										Members: {team.members.length}
									</div>
									<Button
										type="button"
										class="mt-2"
										onclick={() => {
											$joinForm.teamId = team.id;
										}}
										variant={$joinForm.teamId === team.id ? 'default' : 'outline'}
										>Select Team</Button
									>
								</div>
							{/each}
						</div>

						{#if $joinForm.teamId}
							<div class="flex flex-col gap-2">
								<Label for="joinMessage">Message</Label>
								<Textarea
									id="joinMessage"
									name="message"
									bind:value={$joinForm.message}
									placeholder="Introduce yourself to the team..."
								/>
								{#if $joinErrors.message}
									<Label class="text-destructive">
										{$joinErrors.message}
									</Label>
								{/if}
							</div>
						{/if}

						<div class="flex justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								onclick={() => {
									isDialogOpen = false;
								}}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={!$joinForm.teamId || !$joinForm.message}>
								Request to Join
							</Button>
						</div>
					</form>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
