<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { trpc } from '$lib/trpc';
	import { cn } from '$lib/utils';
	import { submissionSchema } from '$lib/zodValidations/submissionSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	let { hackathonId }: { hackathonId: string } = $props();
	let isDialogOpen = $state(false);

	// Initialize form data
	const initialData = {
		hackathonId,
		description: '',
		teamId: '',
		projectName: '',
		title: '',
		githubUrl: '',
		submissionUrl: '',
		score: 0
	};

	let createSubMutation = trpc.submission.createSubmission.mutation();

	const sf = superForm(initialData, {
		validators: zod(submissionSchema),
		dataType: 'json',
		resetForm: true,
		onUpdated: ({ form }) => {
			if (form.valid) {
				$createSubMutation.mutate(form.data);
				trpc.submission.getSubmissionsByHackathonId.utils.invalidate(hackathonId);
				isDialogOpen = false;
			}
		}
	});

	const { form, enhance, errors, message } = sf;
</script>

<Dialog.Root
	controlledOpen
	open={isDialogOpen}
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			sf.reset();
		}
	}}
>
	<Dialog.Trigger
		onclick={() => (isDialogOpen = true)}
		class={cn(buttonVariants({ variant: 'default' }), 'w-full')}>Submit Project</Dialog.Trigger
	>
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

		<form use:enhance method="POST" class="flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<label for="title">Project Title</label>
				<Input id="title" name="title" bind:value={$form.title} />
				{#if $errors.title}
					<div class="text-destructive">{$errors.title}</div>
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

			<input type="hidden" name="hackathonId" bind:value={$form.hackathonId} />

			<div class="flex items-center justify-end gap-2">
				<Button
					onclick={() => {
						isDialogOpen = false;
					}}
					variant="destructive">Cancel</Button
				>
				<Button type="submit">Submit Project</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
