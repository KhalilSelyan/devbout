import { PLATFORM_WALLET_PRIVATEKEY } from '$env/static/private';
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
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';
import { EthereumPrivateKeySignatureProvider } from '@requestnetwork/epk-signature';

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
				// Step 1: Initialize the wallet and provider
				const walletProvider = new ethers.providers.JsonRpcProvider(PUBLIC_JSONRPC_URL);

				const epkSignatureProvider = new EthereumPrivateKeySignatureProvider({
					method: Types.Signature.METHOD.ECDSA,
					privateKey: PLATFORM_WALLET_PRIVATEKEY
				});

				// Step 2: Ensure we're on the correct network
				const chainId = await walletProvider.getNetwork().then((net) => net.chainId);

				if (chainId !== 11155111) {
					// 11155111 is the chain ID for Sepolia
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Not on Sepolia network'
					});
				}

				// Step 3: Set up the RequestNetwork client

				const requestNetwork = new RequestNetwork({
					nodeConnectionConfig: {
						baseURL: 'https://sepolia.gateway.request.network' // Ensure this matches your node
					},
					signatureProvider: epkSignatureProvider,
					skipPersistence: true
				});

				// Step 4: Create the request
				// @ts-expect-error it goes through
				const request = await requestNetwork.createRequest(input.reqParams);

				console.log(request.inMemoryInfo);

				const extensions = request.inMemoryInfo?.requestData.extensions;
				const salt =
					extensions && extensions['pn-eth-fee-proxy-contract']
						? extensions['pn-eth-fee-proxy-contract'].values.salt
						: extensions && extensions['pn-erc20-fee-proxy-contract']
							? extensions['pn-erc20-fee-proxy-contract']?.values.salt
							: undefined;

				const requestNetworkPersister = new RequestNetwork({
					nodeConnectionConfig: {
						baseURL: 'https://sepolia.gateway.request.network' // Ensure this matches your node
					},
					signatureProvider: epkSignatureProvider
				});

				requestNetworkPersister.persistRequest(request);

				return {
					requestId: request.requestId,
					salt
				};
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create request for claiming',
					cause: error
				});
			}
		})
});
