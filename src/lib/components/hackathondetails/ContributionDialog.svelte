<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { contributionSchema } from '$lib/zodValidations/contributionSchema';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	// Define schema for validation
	import { handleRequestPayment, prepareRequestParameters } from '$lib/rn-utils/req'; // Your provided function
	import { appKit } from '$lib/appKit';
	import { z } from 'zod';

	import { switchToTargetNetwork } from '$lib/contract';
	import { trpc } from '$lib/trpc';
	import { ethers } from 'ethers';
	import { route } from '$lib/ROUTES';

	let {
		hackathonId,
		userWalletAddress,
		platformAddress
	}: {
		hackathonId: string;
		userWalletAddress: string;
		platformAddress: string;
	} = $props();

	let isDialogOpen = $state(false);
	let isSubmitted = $state(false);

	// Initialize form data
	const initialData: z.infer<typeof contributionSchema> = {
		amount: '0',
		message: '',
		hackathonId
	};

	let createContribution = trpc.wallet.contributeToContractBalance.mutation();

	async function createContributionToHackathon({ amount }: { amount: string }) {
		// If not connected open the modal to connect
		if (!appKit.getIsConnectedState()) {
			await appKit.open();
		}

		// if now connected show the rest if not ignore
		if (appKit.getIsConnectedState()) {
			const provider = appKit.getWalletProvider();

			if (!provider) {
				console.error('Wallet provider is not available.');
				return false;
			}

			try {
				// Initialize ethers.js provider
				const ethersProvider = new ethers.providers.Web3Provider(provider);

				// Ensure correct network
				await switchToTargetNetwork(ethersProvider, 'eth');

				const reqParams = prepareRequestParameters({
					amountInCrypto: parseFloat(amount),
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
					payerAddress: userWalletAddress,
					platformAddress,
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
					totalAmountInCrypto: parseFloat(amount)
				});

				const reshandle = await handleRequestPayment({
					payerAddress: userWalletAddress,
					persistRequest: true,
					walletProvider: provider,
					requestParameters: reqParams
				});

				console.log({ requestId: reshandle.requestId, userWalletAddress });

				// ON CONFIRM PAYMENT DONE , CALL TRPC ENDPOINT FOR TRANSFERING MONEY FROM PLATFORM WALLET TO SMARTCONTRACT.
				$createContribution.mutate({
					hackathonId,
					amount,
					contributorAddress: userWalletAddress
				});

				return true;
			} catch (err) {
				console.error(err);
				return false;
			}
		}
		return true;
	}

	const sf = superForm(initialData, {
		validators: zod(contributionSchema),
		dataType: 'json',
		resetForm: false,
		onSubmit: async ({ cancel, formData }) => {
			isSubmitted = true;
			const hasGoneThrough = await createContributionToHackathon({
				amount: String(formData.get('amount'))
			});

			console.log({ hasGoneThrough });
			if (!hasGoneThrough) {
				isSubmitted = false;
				cancel();
			}
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				console.log('Form updated successfully');
				trpc.hackathon.getHackathonDetails.utils.invalidate({ hackathonId });
				isDialogOpen = false;
				isSubmitted = false;
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
		class={cn(buttonVariants({ variant: 'default' }), 'w-full')}
	>
		Contribute
	</Dialog.Trigger>
	<Dialog.Overlay
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (!isSubmitted) isDialogOpen = false;
		}}
	/>
	<Dialog.Content class="overflow-y-auto bg-popover sm:max-h-[40rem] sm:max-w-[40rem]">
		<Dialog.Header>
			<Label>Contribute to Hackathon</Label>
			<Dialog.Description>Enter the details to make your contribution</Dialog.Description>
		</Dialog.Header>

		{#if $message}
			<div class="mb-4 text-destructive">{$message}</div>
		{/if}

		<form
			use:enhance
			method="POST"
			action={route('createContribution /hackathons/[id]', { id: hackathonId })}
			class="flex flex-col gap-6"
		>
			<div class="flex flex-col gap-2">
				<label for="amount">Amount in ETH</label>
				<Input
					id="amount"
					name="amount"
					bind:value={$form.amount}
					placeholder={`Enter amount in ETH`}
				/>
				{#if $errors.amount}
					<div class="text-destructive">{$errors.amount}</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="message">Message (Optional)</label>
				<Input
					bind:value={$form.message}
					id="message"
					name="message"
					placeholder="Include a message with your contribution"
				/>
			</div>

			<input type="hidden" name="hackathonId" bind:value={$form.hackathonId} />

			<div class="flex items-center justify-end gap-2">
				<Button
					disabled={isSubmitted}
					onclick={() => {
						isDialogOpen = false;
					}}
					variant="destructive">Cancel</Button
				>
				<Button disabled={isSubmitted} type="submit">Contribute</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
