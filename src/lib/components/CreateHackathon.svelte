<script lang="ts">
	import { PUBLIC_PLATFORM_WALLET_ADDRESS } from '$env/static/public';
	import { appKit } from '$lib/appKit';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import DateRangePicker from '$lib/components/ui/date-range-picker/DateRangePicker.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import { switchToTargetNetwork } from '$lib/contract';
	import { handleRequestPayment, prepareRequestParameters } from '$lib/rn-utils/req';
	import { trpc } from '$lib/trpc';
	import { hackathonSchema } from '$lib/zodValidations/hackathonSchema';
	import { CalendarDate } from '@internationalized/date';
	import type { DateRange } from 'bits-ui';
	import { ethers } from 'ethers';
	import { Trash2 } from 'lucide-svelte';
	import { nanoid } from 'nanoid';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import LoadingOverlay from '$lib/components/LoadinOverlay.svelte';

	// Use page store to get initial form data
	let { data }: { data: SuperValidated<Infer<typeof hackathonSchema>> } = $props();

	let createHackathonMutation = trpc.wallet.createHackathonThroughPlatformWallet.mutation();

	let loading = $state(false);
	let currentStep = $state('');
	let progress = $state(0);
	let error: string | null = $state(null);
	let transactionHash = $state('');

	async function beforeAddHackathonToDb({
		_hackathonId,
		_isCrowdfunded,
		basePrize
	}: {
		_hackathonId: string;
		_isCrowdfunded: boolean;
		basePrize: string;
	}) {
		loading = true;
		// If not connected open the modal to connect
		if (!appKit.getIsConnectedState()) {
			await appKit.open();
		}

		// if now connected show the rest if not ignore
		if (appKit.getIsConnectedState()) {
			currentStep = 'Connecting to wallet...';
			progress = 25;

			const provider = appKit.getWalletProvider();

			if (!provider) {
				console.error('Wallet provider is not available.');
				return false;
			}

			try {
				// Initialize ethers.js provider
				const ethersProvider = new ethers.providers.Web3Provider(provider);

				// Ensure correct network
				currentStep = 'Switching to correct network...';
				progress = 50;
				await switchToTargetNetwork(ethersProvider, 'eth');

				const reqParams = prepareRequestParameters({
					amountInCrypto: parseFloat(basePrize),
					builderId: 'DevBout',
					contributorInfo: {
						address: undefined,
						businessName: 'KhalilSelyan',
						companyRegistration: 'KhalilSelyan',
						email: 'khalil@leodrive.ai',
						firstName: 'Khalil',
						lastName: 'Selyan',
						phone: '',
						taxRegistration: ''
					},
					createdWith: 'DevBout',
					currency: {
						decimals: 18,
						hash: '',
						id: '',
						network: 'sepolia',
						symbol: 'ETH',
						type: 'ETH',
						address: 'eth',
						name: 'sepolia'
					},
					feeAddress: '0x0000000000000000000000000000000000000000',
					feeAmountInCrypto: 0,
					payerAddress: appKit.getAddress()!,
					platformAddress: PUBLIC_PLATFORM_WALLET_ADDRESS,
					platformInfo: {
						address: undefined,
						businessName: 'DevBout',
						companyRegistration: 'DevBout',
						email: 'khalilselyan@gmail.com',
						firstName: 'Dev',
						lastName: 'Bout',
						logo: '',
						name: 'DevBout',
						phone: '',
						taxRegistration: ''
					},
					totalAmountInCrypto: parseFloat(basePrize)
				});

				currentStep = 'Sending transaction...';
				progress = 75;
				const reshandle = await handleRequestPayment({
					payerAddress: appKit.getAddress()!,
					persistRequest: true,
					walletProvider: provider,
					requestParameters: reqParams
				});

				console.log({ requestId: reshandle.requestId });
				transactionHash = reshandle.inMemoryInfo?.transactionData.hash ?? '';

				// ON CONFIRM PAYMENT DONE , CALL TRPC ENDPOINT FOR TRANSFERING MONEY FROM PLATFORM WALLET TO SMARTCONTRACT.
				$createHackathonMutation.mutate({
					hackathonId: _hackathonId,
					isCrowdfunded: _isCrowdfunded,
					basePrize
				});
				currentStep = 'Waiting for confirmation...';
				progress = 90;
				return true;
			} catch (err) {
				console.error(err);
				return false;
			}
		}
		return true;
	}

	let isDialogOpen = $state(false);
	let hackathonId = $state(nanoid());
	let isSubmitting = $state(false);
	let submitButtonText = $state('Create Hackathon');
	// Create superForm with improved configuration
	const sf = superForm(data, {
		validators: zod(hackathonSchema),
		dataType: 'json',
		resetForm: false,
		onSubmit: async ({ cancel, jsonData, formData }) => {
			isSubmitting = true;
			submitButtonText = 'Submitting';
			// Send all data, not just tainted fields
			const allData = Object.fromEntries(Object.entries($form));
			if (String(formData.get('status')) !== 'DRAFT') {
				const hasGoneThrough = await beforeAddHackathonToDb({
					_hackathonId: String(formData.get('hackathonid')),
					_isCrowdfunded: Boolean(formData.get('fundingType')),
					basePrize: String(formData.get('basePrize'))
				});

				if (!hasGoneThrough) {
					isSubmitting = false;
					submitButtonText = 'Create Hackathon';
					cancel();
				}
			}
			// Set data to be posted
			jsonData(allData);
		},
		onUpdated: ({ form }) => {
			console.log({ form });
			if (form.valid) {
				console.log('Form submitted successfully', form.data);
				trpc.hackathon.getHackathons.utils.invalidate();
				progress = 100;
				loading = false;
				submitButtonText = 'Create Hackathon';
				isDialogOpen = false;
			}

			isSubmitting = false;
		}
	});

	const { form, enhance, errors, message } = sf;

	function addCriterion() {
		if ($form.judgingCriteria.length < 5) {
			form.update(
				($form) => {
					$form.judgingCriteria = [...$form.judgingCriteria, { name: 'New Criterion', weight: 0 }];
					return $form;
				},
				{ taint: false }
			);
		}
	}

	function removeCriterion(index: number) {
		if ($form.judgingCriteria.length > 1) {
			form.update(
				($form) => {
					$form.judgingCriteria = $form.judgingCriteria.filter((_, i) => i !== index);
					return $form;
				},
				{ taint: false }
			);
		}
	}

	function validateTeamSizes() {
		const min = $form.minTeamSize;
		const max = $form.maxTeamSize;

		if (min > max) {
			form.update(
				($form) => {
					$form.maxTeamSize = min;
					return $form;
				},
				{ taint: false }
			);
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
		form.update(
			($form) => {
				if (!date.end || !date.start) return $form;
				dateValue = date;
				$form.startDate = date.start.toDate('utc');
				$form.endDate = date.end.toDate('utc');
				return $form;
			},
			{ taint: false }
		);
	};
</script>

<Dialog.Root
	controlledOpen
	open={isDialogOpen}
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			sf.reset();
		} else {
			form.update(
				($form) => {
					$form.hackathonid = hackathonId;
					return $form;
				},
				{ taint: false }
			);
		}
	}}
>
	<Dialog.Trigger
		onclick={() => (isDialogOpen = true)}
		class={buttonVariants({ variant: 'default' })}
	>
		Create Hackathon
	</Dialog.Trigger>
	<Dialog.Overlay
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (!isSubmitting) isDialogOpen = false;
		}}
	/>
	<Dialog.Content class="overflow-y-auto bg-popover sm:max-h-[40rem] sm:max-w-[40rem]">
		<Dialog.Header>
			<Label>Hackathon Details</Label>
			<Dialog.Description>Fill in the details to create your hackathon</Dialog.Description>
		</Dialog.Header>
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

			<div class="hidden">
				<label for="hackathonid">hackathonid</label>
				<Textarea id="hackathonid" name="hackathonid" bind:value={$form.hackathonid} />
				{#if $errors.hackathonid}
					<div class="text-destructive">{$errors.hackathonid}</div>
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
				<div class="relative flex items-center gap-2">
					<Label>Eth</Label>
					<Input
						id="basePrize"
						placeholder="Enter base prize amount"
						name="basePrize"
						bind:value={$form.basePrize}
					/>
				</div>
				{#if $errors.basePrize}
					<div class="text-destructive">{$errors.basePrize}</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="status">Status</label>
				<Select.Root type="single" name="status" bind:value={$form.status}>
					<Select.Trigger>
						<div class="flex items-center gap-2">
							{$form.status
								? $form.status
										.split('_')
										.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
										.join(' ')
								: 'Select funding type'}
						</div>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="DRAFT">Draft</Select.Item>
						<Select.Item value="OPEN">Open</Select.Item>
					</Select.Content>
				</Select.Root>
				{#if $errors.status}
					<div class="text-destructive">{$errors.status}</div>
				{/if}
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

			<div class="flex items-center justify-end gap-2">
				<Button
					onclick={() => {
						isDialogOpen = false;
					}}
					disabled={isSubmitting}
					variant="destructive">Cancel</Button
				>

				<Button
					class="flex items-center gap-2"
					type="submit"
					disabled={!isValidCriteria() || isSubmitting}
				>
					{#if submitButtonText === 'Submitting'}
						<span class="motion-preset-spin motion-duration-2000 motion-loop-infinite">
							<svg
								aria-hidden="true"
								class="h-8 w-8 fill-emerald-600 text-gray-200 dark:text-gray-600"
								viewBox="0 0 100 101"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
									fill="currentColor"
								/>
								<path
									d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
									fill="currentFill"
								/>
							</svg>
						</span>
					{/if}
					<span>{submitButtonText}</span>
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<LoadingOverlay
	isOpen={loading}
	title="Creating Hackathon"
	{currentStep}
	{progress}
	{error}
	canCancel={progress < 75}
	timeEstimate="30-60 seconds"
	{transactionHash}
/>
