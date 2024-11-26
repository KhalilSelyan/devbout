import { router, publicProcedure, authedProcedure } from '$lib/server/trpc';
import { z } from 'zod';
import { hackathonService } from '$lib/server/db/hackathonService';
import { TRPCError } from '@trpc/server';

// Zod schemas for validation
const HackathonStatusEnum = z.enum(['DRAFT', 'OPEN', 'ONGOING', 'JUDGING', 'COMPLETED']);
const FundingTypeEnum = z.enum(['FULLY_FUNDED', 'CROWDFUNDED', 'HYBRID']);

const HackathonCreateSchema = z.object({
	name: z.string().min(3, 'Hackathon name must be at least 3 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	startDate: z.date(),
	endDate: z.date(),
	minTeamSize: z.number().int().min(1).optional().default(1),
	maxTeamSize: z.number().int().min(1),
	prizePool: z.string().optional().default('0'),
	basePrize: z.string().optional().default('0'),
	fundingType: FundingTypeEnum,
	status: HackathonStatusEnum.optional().default('DRAFT'),
	judgingCriteria: z.array(z.object({ name: z.string(), weight: z.number() })).optional(),
	aiGeneratedTopics: z.array(z.string()).optional()
});

const HackathonFilterSchema = z.object({
	status: HackathonStatusEnum.optional(),
	fundingType: FundingTypeEnum.optional(),
	minPrizePool: z.string().optional(),
	organizerId: z.string().optional()
});

export const hackathonRouter = router({
	// Get all hackathons with optional filtering
	getHackathons: publicProcedure
		.input(HackathonFilterSchema.optional())
		.query(async ({ input, ctx }) => {
			return await hackathonService.getHackathons(input, ctx.user?.id);
		}),

	// Get detailed hackathon information
	getHackathonDetails: publicProcedure
		.input(z.object({ hackathonId: z.string() }))
		.query(async ({ input }) => {
			return await hackathonService.getHackathonDetails(input.hackathonId);
		}),

	// Create a new hackathon (protected route)
	createHackathon: authedProcedure.input(HackathonCreateSchema).mutation(async ({ input, ctx }) => {
		return await hackathonService.createHackathon({
			...input,
			organizerId: ctx.user.id
		});
	}),

	// Update an existing hackathon (protected route)
	updateHackathon: authedProcedure
		.input(
			z.object({
				hackathonId: z.string(),
				data: HackathonCreateSchema.partial()
			})
		)
		.mutation(async ({ input, ctx }) => {
			// Optional: Add authorization check to ensure only organizer can update
			const existingHackathon = await hackathonService.getHackathonDetails(input.hackathonId);

			if (existingHackathon?.organizerId !== ctx.user.id) {
				throw new Error('Unauthorized to update this hackathon');
			}

			return await hackathonService.updateHackathon(input.hackathonId, input.data);
		}),

	// Update hackathon status (protected route)
	updateHackathonStatus: authedProcedure
		.input(
			z.object({
				hackathonId: z.string(),
				status: HackathonStatusEnum
			})
		)
		.mutation(async ({ input, ctx }) => {
			// Optional: Add authorization check
			const existingHackathon = await hackathonService.getHackathonDetails(input.hackathonId);

			if (existingHackathon?.organizerId !== ctx.user.id) {
				throw new Error('Unauthorized to update this hackathon status');
			}

			return await hackathonService.updateHackathonStatus(input.hackathonId, input.status);
		}),

	// Get hackathon counts (useful for dashboard)
	getHackathonCounts: publicProcedure.query(async () => {
		return await hackathonService.getHackathonCounts();
	}),

	// Get hackathons with AI-generated topics
	getHackathonsWithAITopics: publicProcedure.query(async () => {
		return await hackathonService.getHackathonsWithAITopics();
	}),

	// Get user's hackathons with their teams
	getUserHackathons: authedProcedure.input(z.string()).query(async ({ input }) => {
		try {
			const hackathons = await hackathonService.getUserHackathons(input);
			return hackathons;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch user hackathons',
				cause: error
			});
		}
	})
});

// Export the router type for client-side type safety
export type HackathonRouter = typeof hackathonRouter;
