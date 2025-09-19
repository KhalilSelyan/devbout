import { authedProcedure, router } from '$lib/server/trpc';
import { userService } from '$lib/server/db/userService';
import { TRPCError } from '@trpc/server';
import { profileUpdateSchema } from '$lib/zodValidations/userSchema';
import { z } from 'zod';
import { RN_API_KEY } from '$env/static/private';

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
				// Use V2 API to get user requests
				const response = await fetch(
					`https://api.request.network/v2/request?payer=${input.address}`,
					{
						headers: {
							'x-api-key': RN_API_KEY
						}
					}
				);

				if (!response.ok) {
					console.error('Request Network API error:', response.status);
					return [
						{
							contentData: { creationDate: '' },
							requestData: { state: '', currency: { value: '' } },
							balance: { balance: '' },
							requestId: ''
						}
					];
				}

				const requests = await response.json();

				// Transform V2 API response to match expected format
				const userRequests = requests.map(
					(req: {
						createdAt?: string;
						status?: string;
						paymentCurrency?: string;
						amount?: string;
						requestId?: string;
					}) => ({
						contentData: {
							creationDate: req.createdAt || ''
						},
						requestData: {
							state: req.status || '',
							currency: { value: req.paymentCurrency || '' }
						},
						balance: {
							balance: req.amount || ''
						},
						requestId: req.requestId || ''
					})
				);

				return userRequests.length > 0
					? userRequests
					: [
							{
								contentData: { creationDate: '' },
								requestData: { state: '', currency: { value: '' } },
								balance: { balance: '' },
								requestId: ''
							}
						];
			} catch (error) {
				console.error('Failed to fetch user requests:', error);
				return [
					{
						contentData: { creationDate: '' },
						requestData: { state: '', currency: { value: '' } },
						balance: { balance: '' },
						requestId: ''
					}
				];
			}
		})
});
