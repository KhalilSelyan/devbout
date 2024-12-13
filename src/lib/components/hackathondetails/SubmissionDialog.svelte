<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { route } from '$lib/ROUTES';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import type { trpcServer } from '$lib/server/server';
	import { trpc } from '$lib/trpc';
	import { cn } from '$lib/utils';
	import { submissionSchema } from '$lib/zodValidations/submissionSchema';
	import type { inferAsyncReturnType } from '@trpc/server';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	type Hackathon = NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;

	let {
		hackathon,
		userHackathons
	}: {
		hackathon: Hackathon;
		userHackathons: NonNullable<
			inferAsyncReturnType<typeof trpcServer.hackathon.getUserHackathons.ssr>
		>;
	} = $props();
	let isDialogOpen = $state(false);
	let isSubmitted = $state(false);
	const currentTeamId = userHackathons.find((hack) => hack.id === hackathon.id)?.teams[0].id || '';

	if (currentTeamId === '') {
		invalidateAll();
	}

	// Initialize form data
	const initialData = {
		hackathonId: hackathon.id,
		description: '',
		teamId: currentTeamId,
		projectName: '',
		githubUrl: '',
		submissionUrl: '',
		score: 0
	};

	const sf = superForm(initialData, {
		validators: zod(submissionSchema),
		dataType: 'json',
		resetForm: true,
		onSubmit: () => {
			isSubmitted = true;
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				console.log('Form submitted successfully', form.data);
				trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId: hackathon.id });
				isDialogOpen = false;
				isSubmitted = false;
			} else {
				console.log(form);
			}
		}
	});

	const { form, enhance, errors, message } = sf;

	$form.teamId = currentTeamId;

	let canSubmit = $derived(hackathon.status === 'OPEN' || hackathon.status === 'ONGOING');
</script>

<Dialog.Root
	controlledOpen
	open={isDialogOpen}
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			sf.reset();
			isDialogOpen = false;
		}
	}}
>
	<Dialog.Trigger
		onclick={() => {
			if (canSubmit) isDialogOpen = true;
		}}
		class={cn(
			buttonVariants({ variant: 'default' }),
			'w-full',
			!canSubmit && 'cursor-default opacity-50 hover:bg-primary'
		)}
		disabled={!canSubmit}
		aria-disabled={!canSubmit}
	>
		{#if !canSubmit}
			Cannot submit projects anymore
		{:else}
			Submit Project
		{/if}
	</Dialog.Trigger>
	<Dialog.Overlay
		onclick={() => {
			isDialogOpen = false;
		}}
	/>
	<Dialog.Content class="overflow-y-auto bg-popover sm:max-h-[40rem] sm:max-w-[40rem]">
		<Dialog.Header>
			<Label>Submit Your Project</Label>
			<Dialog.Description>Fill in the details about your project submission</Dialog.Description>
		</Dialog.Header>

		{#if $message}
			<div class="mb-4 text-destructive">{$message}</div>
		{/if}

		<form
			use:enhance
			action={route('createSubmission /hackathons/[id]', {
				id: hackathon.id
			})}
			method="POST"
			class="flex flex-col gap-6"
		>
			<div class="flex flex-col gap-2">
				<label for="projectName">Project Name</label>
				<Input
					id="projectName"
					name="projectName"
					bind:value={$form.projectName}
					placeholder="Enter your project name"
				/>
				{#if $errors.projectName}
					<div class="text-destructive">{$errors.projectName}</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="description">Project Description</label>
				<Textarea
					id="description"
					name="description"
					bind:value={$form.description}
					placeholder="Describe your project, its features, and how it solves the problem"
				/>
				{#if $errors.description}
					<div class="text-destructive">{$errors.description}</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="githubUrl">GitHub Repository URL</label>
				<Input
					id="githubUrl"
					name="githubUrl"
					bind:value={$form.githubUrl}
					placeholder="https://github.com/username/repository"
				/>
				{#if $errors.githubUrl}
					<div class="text-destructive">{$errors.githubUrl}</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="submissionUrl">Demo URL</label>
				<Input
					id="submissionUrl"
					name="submissionUrl"
					bind:value={$form.submissionUrl}
					placeholder="https://your-demo-url.com"
				/>
				{#if $errors.submissionUrl}
					<div class="text-destructive">{$errors.submissionUrl}</div>
				{/if}
			</div>

			<input type="hidden" id="teamId" name="teamId" bind:value={$form.teamId} />
			<input type="hidden" id="score" name="score" bind:value={$form.score} />
			<input type="hidden" name="hackathonId" bind:value={$form.hackathonId} />

			<div class="flex items-center justify-end gap-2">
				<Button
					disabled={isSubmitted}
					onclick={() => {
						isDialogOpen = false;
					}}
					variant="destructive">Cancel</Button
				>
				<Button disabled={isSubmitted} type="submit">Submit Project</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
