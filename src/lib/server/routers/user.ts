import { authedProcedure, router } from '$lib/server/trpc';
import { userService } from '$lib/server/db/userService';
import { TRPCError } from '@trpc/server';
import { profileUpdateSchema } from '$lib/zodValidations/userSchema';
import { z } from 'zod';
import { RequestNetwork, Types } from '@requestnetwork/request-client.js';

export const userRouter = router({
	getProfile: authedProcedure.input(z.string()).query(async ({ input }) => {
		try {
			const profile = await userService.getUserProfile(input);
			return profile;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch user profile',
				cause: error
			});
		}
	}),

	updateProfile: authedProcedure.input(profileUpdateSchema).mutation(async ({ input, ctx }) => {
		try {
			const updated = await userService.updateUserProfile(ctx.user.id, input);
			return updated;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to update profile',
				cause: error
			});
		}
	}),
	updateWalletAddress: authedProcedure
		.input(z.object({ walletAddress: z.string() }))
		.mutation(async ({ input, ctx }) => {
			try {
				const updated = await userService.updateWalletAddress(ctx.user.id, input.walletAddress);
				return updated;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update walletAddress',
					cause: error
				});
			}
		}),
	getContributions: authedProcedure.query(async ({ ctx }) => {
		try {
			const contributions = await userService.getAllUserContributions(ctx.user.id);
			return contributions;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch user contributions',
				cause: error
			});
		}
	}),
	getUserRequests: authedProcedure
		.input(z.object({ address: z.string().nullable().optional() }))
		.query(async ({ input }) => {
			if (!input.address || input.address === '' || input.address == null) {
				return [
					{
						contentData: { creationDate: '' },
						requestData: { state: '' },
						balance: { balance: '' },
						requestId: ''
					}
				];
			}
			try {
				const requests = await new RequestNetwork({
					nodeConnectionConfig: {
						baseURL: 'https://sepolia.gateway.request.network'
					}
				}).fromIdentity({
					type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
					value: input.address
				});
				const userRequests = requests
					.map((req) => {
						return {
							// @ts-expect-error this is fine
							contentData: req.contentData,
							// @ts-expect-error this is fine
							requestData: req.requestData,
							// @ts-expect-error this is fine
							balance: req.balance,
							requestId: req.requestId
						};
					})
					.filter((t) => t != undefined);

				return (
					userRequests ?? [
						{
							contentData: { creationDate: '' },
							requestData: { state: '', currency: { value: '' } },
							balance: { balance: '' },
							requestId: ''
						}
					]
				);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch user requests',
					cause: error
				});
			}
		})
});
