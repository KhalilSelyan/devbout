import { PLATFORM_WALLET_PRIVATEKEY, RN_API_KEY } from '$env/static/private';
import {
	PUBLIC_CONTRACT_ADDRESS,
	PUBLIC_JSONRPC_URL,
	PUBLIC_PLATFORM_WALLET_ADDRESS
} from '$env/static/public';
import { announceWinner } from '$lib/contract';
import { contractabi } from '$lib/contractabi';
import { type prepareRequestParameters } from '$lib/rn-utils/req';
import { authedProcedure, router } from '$lib/server/trpc';
import { TRPCError } from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import { ethers } from 'ethers';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { hackathon, prizePool, team } from '../db/schema';

export const walletRouter = router({
	contributeToContractBalance: authedProcedure
		.input(
			z.object({
				hackathonId: z.string(),
				amount: z.string(),
				contributorAddress: z.string(),
				transactionHash: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				// create a new db record for the contribution as well as update the hackathon total prize
				await ctx.db
					.insert(prizePool)
					.values({
						id: nanoid(),
						hackathonId: input.hackathonId,
						userId: ctx.user.id,
						amount: input.amount,
						transactionHash: input.transactionHash,
						contributedAt: new Date()
					})
					.catch((err) => {
						console.error(err);
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Failed to insert contributions',
							cause: err
						});
					});

				await ctx.db
					.update(hackathon)
					.set({
						prizePool: sql`(CAST(${hackathon.prizePool} AS numeric) + CAST(${input.amount} AS numeric))::text`
					})
					.where(eq(hackathon.id, input.hackathonId))
					.catch((err) => {
						console.error(err);
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Failed to update hackathon contributions',
							cause: err
						});
					});

				console.log(
					`Successfully transferred ${input.amount} wei to ${PUBLIC_PLATFORM_WALLET_ADDRESS}`
				);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update contributions',
					cause: error
				});
			}
		}),
	announceWinner: authedProcedure
		.input(
			z.object({
				hackathonId: z.string(),
				winningParticipantAddress: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const provider = new ethers.providers.JsonRpcProvider(PUBLIC_JSONRPC_URL);

				const wallet = new ethers.Wallet(PLATFORM_WALLET_PRIVATEKEY, provider);

				const contract = new ethers.Contract(PUBLIC_CONTRACT_ADDRESS, contractabi, wallet);

				console.log({ id: input.hackathonId, winner: input.winningParticipantAddress });

				const e = await announceWinner({
					_hackathonId: input.hackathonId,
					_winningParticipant: input.winningParticipantAddress,
					contract
				}).catch((e) => {
					console.error(e);
				});

				await ctx.db
					.update(team)
					.set({
						isWinner: true
					})
					.where(eq(team.hackathonId, input.hackathonId));

				console.log({ e });
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create hackathon',
					cause: error
				});
			}
		}),
	createRequestForClaiming: authedProcedure
		.input(
			z.object({
				reqParams: z.custom<ReturnType<typeof prepareRequestParameters>>()
			})
		)
		.mutation(async ({ input }) => {
			try {
				const { reqParams } = input;

				const currency = reqParams.requestInfo.currency;
				const isERC20 = currency.type === 'ERC20';

				// Get decimals from the original currency object (assuming it's passed in the contentData)
				const originalCurrency = reqParams.contentData?.miscellaneous?.paymentCurrency;
				const decimals = (originalCurrency as { decimals?: number })?.decimals || 18; // Default to 18 for ETH

				// Determine payment currency format for API
				let paymentCurrency: string;
				if (isERC20 && currency.value) {
					paymentCurrency = `${currency.value}-${currency.network}-${currency.network}`;
				} else {
					paymentCurrency = `${currency.value?.toUpperCase() || 'ETH'}-${currency.network}-${currency.network}`;
				}

				// Step 4: Prepare API request body
				const apiRequestBody = {
					payee: reqParams.requestInfo.payee.value,
					payer: reqParams.requestInfo.payer.value,
					amount: ethers.utils.formatUnits(reqParams.requestInfo.expectedAmount, decimals),
					invoiceCurrency: 'USD', // Default to USD for invoice currency
					paymentCurrency: paymentCurrency,
					isCryptoToFiatAvailable: false
				};

				// Step 5: Create request using Request Network API
				const response = await fetch('https://api.request.network/v2/request', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-api-key': RN_API_KEY
					},
					body: JSON.stringify(apiRequestBody)
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error('Request Network API error:', response.status, errorText);
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Request Network API error: ${response.status}`,
						cause: errorText
					});
				}

				const result = await response.json();

				console.log('Request created successfully:', result);

				return {
					requestId: result.requestId,
					paymentReference: result.paymentReference
				};
			} catch (error) {
				console.error('Error creating request:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create request for claiming',
					cause: error
				});
			}
		})
});
