<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import DateRangePicker from '$lib/components/ui/date-range-picker/DateRangePicker.svelte';
	import { hackathonSchema } from '$lib/zodValidations/hackathonSchema';
	import { DollarSign, Trash2 } from 'lucide-svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import * as z from 'zod';
	import type { DateRange } from 'bits-ui';
	import { CalendarDate } from '@internationalized/date';
	// Type inference for form values
	type HackathonFormValues = z.infer<typeof hackathonSchema>;

	// Default values
	const defaultValues: HackathonFormValues = {
		name: '',
		description: '',
		startDate: new Date(),
		endDate: new Date(),
		minTeamSize: '1',
		maxTeamSize: '5',
		basePrize: '0',
		fundingType: 'FULLY_FUNDED',
		judgingCriteria: [{ name: 'Innovation', weight: 40 }],
		useAITopics: false
	};

	// Use page store to get initial form data
	let { data }: { data: SuperValidated<Infer<typeof hackathonSchema>> } = $props();

	// Create superForm with improved configuration
	const sf = superForm(data, {
		validators: zod(hackathonSchema),
		dataType: 'json',
		resetForm: true,
		onUpdated: ({ form }) => {
			if (form.valid) {
				console.log('Form submitted successfully', form.data);
			}
		}
	});

	const { form, enhance, errors, message } = sf;

	function addCriterion() {
		if ($form.judgingCriteria.length < 5) {
			$form.judgingCriteria = [...$form.judgingCriteria, { name: 'New Criterion', weight: 0 }];
		}
	}

	function removeCriterion(index: number) {
		if ($form.judgingCriteria.length > 1) {
			$form.judgingCriteria = $form.judgingCriteria.filter((_, i) => i !== index);
		}
	}

	function validateTeamSizes() {
		const min = $form.minTeamSize;
		const max = $form.maxTeamSize;

		if (min > max) {
			$form.maxTeamSize = min;
		}
	}

	// Add this helper function to calculate total weight
	function getTotalWeight() {
		return $form.judgingCriteria.reduce((sum, c) => sum + c.weight, 0);
	}

	// Add this validation helper
	function isValidCriteria() {
		return $form.judgingCriteria.every((c) => c.name.trim() !== '') && getTotalWeight() === 100;
	}

	const today = new Date();
	const startDate = new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
	const endDate = startDate.add({ days: 20 });

	let dateValue: DateRange = $state({
		start: startDate,
		end: endDate
	});

	const updateDateValue = (date: DateRange) => {
		if (!date.end || !date.start) return;
		dateValue = date;
		$form.startDate = date.start.toDate('utc');
		$form.endDate = date.end.toDate('utc');
	};
</script>

<div class="min-h-screen bg-background">
	<header class="bg-muted">
		<div class="container mx-auto py-6">
			<h1 class="text-3xl font-bold text-foreground">Create a New Hackathon</h1>
		</div>
	</header>
	<main class="container mx-auto py-6">
		<Card>
			<CardHeader>
				<CardTitle>Hackathon Details</CardTitle>
				<CardDescription>Fill in the details to create your hackathon</CardDescription>
			</CardHeader>
			<CardContent>
				{#if $message}
					<div class="mb-4 text-destructive">{$message}</div>
				{/if}

				<form use:enhance method="POST" class="flex flex-col gap-8">
					<div class="flex flex-col gap-2">
						<label for="name">Hackathon Name</label>
						<Input id="name" name="name" bind:value={$form.name} />
						{#if $errors.name}
							<div class="text-destructive">{$errors.name}</div>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<label for="description">Description</label>
						<Textarea id="description" name="description" bind:value={$form.description} />
						{#if $errors.description}
							<div class="text-destructive">{$errors.description}</div>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<label for="dateRange">Date Range</label>
						<DateRangePicker {updateDateValue} />
						<div hidden>
							<label for="startDate">start</label>
							<input id="startDate" type="datetime" name="startDate" bind:value={dateValue.start} />
							<label for="endDate">end</label>
							<input id="endDate" type="datetime" name="endDate" bind:value={dateValue.end} />
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex w-full flex-col gap-2">
							<label for="minTeamSize">Min Team Size</label>
							<Input
								id="minTeamSize"
								name="minTeamSize"
								bind:value={$form.minTeamSize}
								oninput={validateTeamSizes}
							/>
							{#if $errors.minTeamSize}
								<div class="text-destructive">{$errors.minTeamSize}</div>
							{/if}
						</div>

						<div class="flex w-full flex-col gap-2">
							<label for="maxTeamSize">Max Team Size</label>
							<Input
								id="maxTeamSize"
								name="maxTeamSize"
								bind:value={$form.maxTeamSize}
								oninput={validateTeamSizes}
							/>
							{#if $errors.maxTeamSize}
								<div class="text-destructive">{$errors.maxTeamSize}</div>
							{/if}
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<label for="basePrize">Base Prize</label>
						<div class="relative">
							<DollarSign
								class="absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"
							/>
							<Input
								id="basePrize"
								class="pl-8"
								placeholder="Enter base prize amount"
								name="basePrize"
								bind:value={$form.basePrize}
							/>
							{#if $errors.basePrize}
								<div class="text-destructive">{$errors.basePrize}</div>
							{/if}
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<label for="fundingType">Funding Type</label>
						<Select.Root type="single" name="fundingType" bind:value={$form.fundingType}>
							<Select.Trigger>
								<div class="flex items-center gap-2">
									{$form.fundingType
										? $form.fundingType
												.split('_')
												.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
												.join(' ')
										: 'Select funding type'}
								</div>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="FULLY_FUNDED">Fully Funded</Select.Item>
								<Select.Item value="CROWDFUNDED">Crowdfunded</Select.Item>
								<Select.Item value="HYBRID">Hybrid</Select.Item>
							</Select.Content>
						</Select.Root>
						{#if $errors.fundingType}
							<div class="text-destructive">{$errors.fundingType}</div>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<label for="judgingcriteria">Judging Criteria</label>
							<span>Total Weight: {getTotalWeight()}%</span>
							{#if getTotalWeight() !== 100}
								<span class="text-destructive">Total weight must equal 100%</span>
							{/if}
						</div>
						{#each $form.judgingCriteria as criterion, index (index)}
							<div class="mt-2 flex items-center gap-2">
								<Input
									name={`judgingCriteria.${index}.name`}
									placeholder="Criterion name"
									bind:value={$form.judgingCriteria[index].name}
									class={!criterion.name.trim() ? 'border-destructive' : ''}
								/>
								<Slider
									min={0}
									max={100}
									step={1}
									value={[criterion.weight]}
									onValueChange={(e) => {
										$form.judgingCriteria[index].weight = e[0];
									}}
								/>
								<Badge variant="secondary">{criterion.weight}%</Badge>
								{#if $form.judgingCriteria.length > 1}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onclick={() => removeCriterion(index)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/each}

						{#if $form.judgingCriteria.length < 5}
							<Button type="button" variant="outline" onclick={addCriterion} class="mt-2">
								Add Criterion
							</Button>
						{/if}
					</div>

					<div class="flex flex-row items-center justify-between rounded-lg border p-4">
						<div class="flex flex-col gap-0.5">
							<label for="aigentopics" class="text-base">Use AI-generated Topics</label>
							<p class="text-sm text-muted-foreground">
								Enable AI to suggest hackathon topics based on the description
							</p>
						</div>
						<Switch
							checked={$form.useAITopics}
							onCheckedChange={(checked) => ($form.useAITopics = checked)}
						/>
					</div>

					<Button type="submit" disabled={!isValidCriteria()}>Create Hackathon</Button>
				</form>
			</CardContent>
		</Card>
	</main>
</div>
