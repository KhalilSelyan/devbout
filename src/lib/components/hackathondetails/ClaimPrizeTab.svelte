<script lang="ts">
	import { PUBLIC_CONTRACT_ADDRESS, PUBLIC_PLATFORM_WALLET_ADDRESS } from '$env/static/public';
	import { appKit } from '$lib/appKit';
	import { useWalletState } from '$lib/appKitState.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import {
		executeBatchPayments,
		switchToTargetNetwork,
		claimPrize as claimContractPrize
	} from '$lib/contract';
	import { contractabi } from '$lib/contractabi';
	import { prepareRequestParameters } from '$lib/rn-utils/req';
	import type { hackathonService } from '$lib/server/db/hackathonService';
	import { trpc } from '$lib/trpc';
	import { PaymentReferenceCalculator } from '@requestnetwork/request-client.js';
	import type { User } from 'better-auth';
	import { ethers } from 'ethers';
	import { toast } from 'svelte-sonner';
	import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
	import { goto } from '$app/navigation';
	import { route } from '$lib/ROUTES';

	let {
		hackathon,
		user
	}: {
		hackathon: NonNullable<Awaited<ReturnType<typeof hackathonService.getHackathonDetails>>>;
		user: User;
	} = $props();
	let claiming = $state(false);
	let loadingState: { winnerName: string; remaining: number } | null = $state(null);

	const walletState = useWalletState();

	let claimFromBackend = trpc.wallet.createRequestForClaiming.mutation();
	let getTeamAddresses = trpc.team.getTeamMemberWalletAddresses.mutation();
	let updateHackathonState = trpc.hackathon.updateHackathonStatus.mutation();

	async function claimPrize() {
		claiming = true;
		// If not connected open the modal to connect
		if (!appKit.getIsConnectedState()) {
			await appKit.open();
		}

		// if now connected show the rest if not ignore
		if (appKit.getIsConnectedState()) {
			const provider = appKit.getWalletProvider();

			if (!provider) {
				console.error('Wallet provider is not available.');
				toast.error('Wallet provider is not available.');
				return false;
			}

			try {
				// Initialize ethers.js provider
				const ethersProvider = new ethers.providers.Web3Provider(provider);

				// Ensure correct network
				await switchToTargetNetwork(ethersProvider, 'eth');
				if (!hackathon) return toast.error('no hackathon detected');
				if (!walletState.address) return toast.error('connect your wallet');

				const winningTeam = hackathon.teams.find((team) => team.isWinner);

				if (!winningTeam) return toast.error('no winning team');

				const teamWallets = await $getTeamAddresses.mutateAsync({ teamId: winningTeam.id });

				const memberPrize = +hackathon.prizePool! / winningTeam.members.length;

				let allReqParams: Array<ReturnType<typeof prepareRequestParameters> | null> = [];

				teamWallets.map((wallet) => {
					if (!wallet.user.walletAddress) {
						toast.error(
							`no wallet address found for ${wallet.user.name} -- ${wallet.user.email}, contact them separately `
						);
						return null;
					}
					const reqParams = prepareRequestParameters({
						amountInCrypto: memberPrize,
						builderId: 'DevBout',
						platformInfo: {
							address: {
								'country-name': wallet.user.countryName ?? '',
								'postal-code': wallet.user.postalCode ?? '',
								'street-address': wallet.user.streetAddress ?? '',
								locality: wallet.user.locality ?? ''
							},
							businessName: wallet.user.businessName ?? '',
							companyRegistration: wallet.user.businessName ?? '',
							email: wallet.user.email,
							firstName: wallet.user.firstName ?? '',
							lastName: wallet.user.lastName ?? '',
							phone: wallet.user.phone ?? '',
							logo: '',
							name: wallet.user.name,
							taxRegistration: wallet.user.taxRegistration ?? ''
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
						payerAddress: PUBLIC_PLATFORM_WALLET_ADDRESS,
						platformAddress: wallet.user.walletAddress,
						contributorInfo: {
							address: undefined,
							businessName: 'DevBout',
							companyRegistration: 'DevBout',
							email: 'khalilselyan@gmail.com',
							firstName: 'Dev',
							lastName: 'Bout',
							phone: '',
							taxRegistration: ''
						},
						totalAmountInCrypto: memberPrize
					});

					allReqParams.push(reqParams);
				});

				const reshandle = await Promise.all(
					allReqParams.map((reqParams) => reqParams && $claimFromBackend.mutateAsync({ reqParams }))
				);

				console.log({ req: reshandle });

				const _paymentRefs = reshandle
					.map((res, index) => {
						const paymentRef =
							res &&
							teamWallets[index].user.walletAddress &&
							PaymentReferenceCalculator.calculate(
								res.requestId,
								res?.salt,
								teamWallets[index].user.walletAddress
							);
						return paymentRef ? paymentRef : undefined;
					})
					.filter((ref) => ref != undefined);
				console.log({ _paymentRefs });

				const contract = new ethers.Contract(
					PUBLIC_CONTRACT_ADDRESS,
					contractabi,
					ethersProvider.getSigner()
				);

				const recipients = teamWallets.map((t) => t.user.walletAddress ?? '');

				const amounts = new Array<number>(recipients.length).fill(memberPrize);

				// Create RequestDetail objects
				// const requestDetails = recipients
				// 	.map((recipient, index) => {
				// 		if (!recipient) return;
				// 		return {
				// 			recipient,
				// 			requestAmount: ethers.utils.parseUnits(amounts[index].toString(), 18),
				// 			path: [],
				// 			paymentReference: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(_paymentRefs[index])),
				// 			feeAmount: ethers.BigNumber.from(0),
				// 			maxToSpend: ethers.BigNumber.from(0),
				// 			maxRateTimespan: ethers.BigNumber.from(0)
				// 		};
				// 	})
				// 	.filter((t) => t != undefined);

				// const batchPaymentProps: Parameters<typeof executeBatchPayments>[0] = {
				// 	_hackathonId: hackathon.id,
				// 	requestDetails: requestDetails,
				// 	skipFeeUSDLimit: false,
				// 	feeAddress: '0x0000000000000000000000000000000000000000',
				// 	contract
				// };

				// const tet = await executeBatchPayments(batchPaymentProps);

				for (const [index, recipient] of recipients.entries()) {
					loadingState = {
						winnerName: teamWallets[index].user.name,
						remaining: recipients.length - index
					}; // Update loading state

					const claimPrizeProps: Parameters<typeof claimContractPrize>[0] = {
						_hackathonId: hackathon.id,
						_winnerAddress: recipient,
						_paymentRef: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(_paymentRefs[index])),
						_wonAmount: ethers.utils.parseEther(amounts[index].toString()),
						contract
					};

					await claimContractPrize(claimPrizeProps);
				}

				loadingState = null; // Reset loading state after processing
				await $updateHackathonState.mutateAsync(
					{ status: 'PAID', hackathonId: hackathon.id },
					{
						onSuccess: () => {
							goto(route('/'));
						}
					}
				);

				return true;
			} catch (err) {
				console.error('Failed to claim prize:', err);
				toast.error('Failed to claim prize');
				return false;
			} finally {
				claiming = false;
			}
		}
		return true;
	}
</script>

<div class="space-y-4">
	<h2 class="text-xl font-bold">Claim Your Prize</h2>
	<ul class="space-y-2">
		{#each hackathon.teams as team}
			{#if team.isWinner}
				<li class="flex items-center justify-between rounded border p-4">
					<div>
						<Label>{team.name}</Label>
						<p class="text-sm text-gray-500">
							Members: {team.members.map((member) => member.user.name).join(', ')}
						</p>
					</div>
					<Button onclick={async () => await claimPrize()} disabled={claiming}>Claim Prize</Button>
				</li>
			{/if}
		{/each}
	</ul>
</div>

{#if loadingState}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
		<Card>
			<CardHeader>
				<CardTitle>Claiming Prize</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Claiming prize for: {loadingState.winnerName}</p>
				<p>Remaining: {loadingState.remaining}</p>
			</CardContent>
		</Card>
	</div>
{/if}
