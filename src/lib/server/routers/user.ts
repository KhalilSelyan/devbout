import { authedProcedure, router } from '$lib/server/trpc';
import { userService } from '$lib/server/db/userService';
import { TRPCError } from '@trpc/server';
import { profileUpdateSchema } from '$lib/zodValidations/userSchema';
import { z } from 'zod';

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
		})
});
