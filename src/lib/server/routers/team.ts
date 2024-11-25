import { authedProcedure, router } from '$lib/server/trpc';
import { teamService } from '$lib/server/db/teamService';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const teamCreateSchema = z.object({
	hackathonId: z.string(),
	name: z.string().min(3, 'Team name must be at least 3 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters')
});

const teamJoinRequestSchema = z.object({
	teamId: z.string(),
	message: z.string().optional()
});

const teamActionSchema = z.object({
	teamId: z.string(),
	userId: z.string()
});

const handleJoinRequestSchema = z.object({
	requestId: z.string(),
	status: z.enum(['ACCEPTED', 'REJECTED'])
});

export const teamRouter = router({
	// Create a new team
	createTeam: authedProcedure.input(teamCreateSchema).mutation(async ({ input, ctx }) => {
		try {
			const team = await teamService.createTeam(input, ctx.user.id);
			return team;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to create team',
				cause: error
			});
		}
	}),

	// Get teams for a specific hackathon
	getHackathonTeams: authedProcedure.input(z.string()).query(async ({ input }) => {
		try {
			const teams = await teamService.getHackathonTeams(input);
			return teams;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch teams',
				cause: error
			});
		}
	}),

	// Get specific team details
	getTeamDetails: authedProcedure.input(z.string()).query(async ({ input }) => {
		try {
			const team = await teamService.getTeamDetails(input);
			if (!team) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Team not found'
				});
			}
			return team;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch team details',
				cause: error
			});
		}
	}),

	// Request to join a team
	requestToJoinTeam: authedProcedure
		.input(teamJoinRequestSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const request = await teamService.requestToJoinTeam(
					input.teamId,
					ctx.user.id,
					input.message
				);
				return request;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to submit join request',
					cause: error
				});
			}
		}),

	// Handle join request (accept/reject)
	handleJoinRequest: authedProcedure
		.input(handleJoinRequestSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const result = await teamService.handleJoinRequest(
					input.requestId,
					ctx.user.id,
					input.status
				);
				return result;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to handle join request',
					cause: error
				});
			}
		}),

	// Leave team
	leaveTeam: authedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
		try {
			await teamService.leaveTeam(input, ctx.user.id);
			return { success: true };
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to leave team',
				cause: error
			});
		}
	}),

	// Kick member from team
	kickMember: authedProcedure.input(teamActionSchema).mutation(async ({ input, ctx }) => {
		try {
			await teamService.kickMember(input.teamId, input.userId, ctx.user.id);
			return { success: true };
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to kick member',
				cause: error
			});
		}
	}),

	// Get pending join requests for a team
	getTeamJoinRequests: authedProcedure.input(z.string()).query(async ({ input, ctx }) => {
		try {
			const requests = await teamService.getTeamJoinRequests(input, ctx.session.userId);
			return requests;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch join requests',
				cause: error
			});
		}
	}),
	getLeaderTeamRequests: authedProcedure.query(async ({ ctx }) => {
		return await teamService.getLeaderTeamRequests(ctx.user.id);
	})
});
