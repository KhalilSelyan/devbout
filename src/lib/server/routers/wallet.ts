import { PLATFORM_WALLET_PRIVATEKEY } from '$env/static/private';
import { PUBLIC_CONTRACT_ADDRESS, PUBLIC_PLATFORM_WALLET_ADDRESS } from '$env/static/public';
import { createHackathon } from '$lib/contract';
import { contractabi } from '$lib/contractabi';
import { authedProcedure, router } from '$lib/server/trpc';
import { TRPCError } from '@trpc/server';
import { ethers } from 'ethers';
import { z } from 'zod';

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
				const provider = new ethers.providers.JsonRpcProvider('https://sepolia.rpc.thirdweb.com');
				console.log({ provider });
				const wallet = new ethers.Wallet(PLATFORM_WALLET_PRIVATEKEY, provider);
				console.log({ wallet });
				const contract = new ethers.Contract(PUBLIC_CONTRACT_ADDRESS, contractabi, wallet);
				console.log({ contract });

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
		})
});
