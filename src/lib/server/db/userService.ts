import { db } from './index';
import { prizePool, user } from './schema';
import { eq } from 'drizzle-orm';
import { type schema, type profileUpdateSchema } from '$lib/zodValidations/userSchema';
import type { z } from 'zod';

type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const userService = {
	async getUserProfile(userId: string) {
		const profile = await db.query.user.findFirst({
			where: eq(user.id, userId),
			with: {
				badges: true,
				teamMemberships: true,
				prizeContributions: {
					with: {
						hackathon: true,
						contributor: true
					}
				}
			}
		});

		if (!profile) {
			throw new Error('User not found');
		}

		return profile;
	},

	async updateUserProfile(userId: string, data: ProfileUpdateInput) {
		// First, get the existing user data
		const currentUser = await db.query.user.findFirst({
			where: eq(user.id, userId)
		});

		// Merge skills, prioritizing new values
		const mergedSkills = {
			...((currentUser?.skills as Record<string, string>) || {}), // Cast existing skills
			...(data.skills || {}) // New skills will override existing ones with same key
		};

		return await db
			.update(user)
			.set({
				...data,
				skills: mergedSkills,
				updatedAt: new Date()
			})
			.where(eq(user.id, userId))
			.returning();
	},
	async updateWalletAddress(userId: string, walletAddress: string) {
		return await db
			.update(user)
			.set({
				walletAddress,
				updatedAt: new Date()
			})
			.where(eq(user.id, userId))
			.returning();
	},
	async getAllUserContributions(userId: string) {
		const contributions = await db.query.prizePool.findMany({
			where: eq(prizePool.userId, userId),
			with: {
				hackathon: true,
				contributor: true
			}
		});

		return contributions;
	},
	async updateUserInfo(userId: string, userInfo: z.infer<typeof schema>) {
		const updatedData = {
			...userInfo,
			streetAddress: userInfo.address['street-address'] || undefined,
			countryName: userInfo.address['country-name'] || undefined,
			locality: userInfo.address.locality || undefined,
			postalCode: userInfo.address['postal-code'] || undefined,
			updatedAt: new Date()
		};

		// Filter out properties with undefined values
		const filteredData = Object.fromEntries(
			Object.entries(updatedData).filter(([, v]) => v !== undefined && v !== '')
		);

		return await db.update(user).set(filteredData).where(eq(user.id, userId)).returning();
	}
};
