import { PLATFORM_WALLET_PRIVATEKEY } from '$env/static/private';
import {
	PUBLIC_CONTRACT_ADDRESS,
	PUBLIC_JSONRPC_URL,
	PUBLIC_PLATFORM_WALLET_ADDRESS
} from '$env/static/public';
import { createHackathon, recordContribution } from '$lib/contract';
import { contractabi } from '$lib/contractabi';
import { authedProcedure, router } from '$lib/server/trpc';
import { TRPCError } from '@trpc/server';
import { ethers } from 'ethers';
import { z } from 'zod';
import { hackathon, prizePool } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const walletRouter = router({
	createHackathonThroughPlatformWallet: authedProcedure
		.input(
			z.object({
				hackathonId: z.string(),
				basePrize: z.string(),
				isCrowdfunded: z.boolean()
			})
		)
		.mutation(async ({ input }) => {
			try {
				const provider = new ethers.providers.JsonRpcProvider(PUBLIC_JSONRPC_URL);

				const wallet = new ethers.Wallet(PLATFORM_WALLET_PRIVATEKEY, provider);

				const contract = new ethers.Contract(PUBLIC_CONTRACT_ADDRESS, contractabi, wallet);

				await createHackathon({
					_hackathonId: input.hackathonId,
					_isCrowdfunded: input.isCrowdfunded,
					basePrize: input.basePrize,
					contract
				});

				console.log(
					`Successfully transferred ${input.basePrize} wei to ${PUBLIC_PLATFORM_WALLET_ADDRESS}`
				);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create hackathon',
					cause: error
				});
			}
		}),
	contributeToContractBalance: authedProcedure
		.input(
			z.object({
				hackathonId: z.string(),
				amount: z.string(),
				contributorAddress: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const provider = new ethers.providers.JsonRpcProvider(PUBLIC_JSONRPC_URL);

				const wallet = new ethers.Wallet(PLATFORM_WALLET_PRIVATEKEY, provider);

				const contract = new ethers.Contract(PUBLIC_CONTRACT_ADDRESS, contractabi, wallet);

				const transactionHash = await recordContribution({
					_hackathonId: input.hackathonId,
					_contributor: input.contributorAddress,
					_amount: input.amount,
					contract
				});

				// create a new db record for the contribution as well as update the hackathon total prize
				await ctx.db
					.insert(prizePool)
					.values({
						id: nanoid(),
						hackathonId: input.hackathonId,
						userId: ctx.user.id,
						amount: input.amount,
						transactionHash,
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
		})
});
