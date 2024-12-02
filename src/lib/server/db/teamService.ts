import { db } from './index';
import { team, teamMember, teamJoinRequest } from './schema';
import { eq, and, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type TeamCreateInput = Omit<typeof team.$inferInsert, 'createdAt'>;

export const teamService = {
	// Create a new team
	async createTeam(data: TeamCreateInput, leaderId: string) {
		// Create team and add leader in a transaction
		return await db.transaction(async (tx) => {
			const newTeam = await tx
				.insert(team)
				.values({
					...data,
					createdAt: new Date()
				})
				.returning();

			// Add team leader
			await tx.insert(teamMember).values({
				id: nanoid(),
				teamId: data.id,
				userId: leaderId,
				role: 'LEADER',
				joinedAt: new Date()
			});

			return newTeam;
		});
	},

	// Get team details including members
	async getTeamDetails(teamId: string) {
		return await db.query.team.findFirst({
			where: eq(team.id, teamId),
			with: {
				hackathon: true,
				joinRequests: true,
				members: {
					with: {
						team: true,
						user: true
					}
				},
				submissions: true
			}
		});
	},

	// Request to join a team
	async requestToJoinTeam(teamId: string, userId: string, message?: string) {
		// Check if user already has a pending request
		const existingRequest = await db.query.teamJoinRequest.findFirst({
			where: and(
				eq(teamJoinRequest.teamId, teamId),
				eq(teamJoinRequest.userId, userId),
				eq(teamJoinRequest.status, 'PENDING')
			)
		});

		if (existingRequest) {
			throw new Error('You already have a pending request for this team');
		}

		// Check if user is already in a team for this hackathon
		const targetTeam = await db.query.team.findFirst({
			where: eq(team.id, teamId)
		});

		if (!targetTeam) {
			throw new Error('Team not found');
		}

		const existingMembership = await db.query.teamMember.findFirst({
			where: eq(teamMember.userId, userId),
			with: {
				team: true
			}
		});

		if (existingMembership) {
			throw new Error('User is already in a team for this hackathon');
		}

		return await db
			.insert(teamJoinRequest)
			.values({
				id: nanoid(),
				teamId,
				userId,
				message,
				status: 'PENDING',
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();
	},

	// Handle join request (accept/reject)
	async handleJoinRequest(requestId: string, leaderId: string, status: 'ACCEPTED' | 'REJECTED') {
		try {
			const request = await db.query.teamJoinRequest.findFirst({
				where: eq(teamJoinRequest.id, requestId),
				with: {
					team: {
						with: {
							members: true
						}
					}
				}
			});

			if (!request) {
				throw new Error('Join request not found');
			}

			// Verify that the user handling the request is the team leader
			const isLeader = await db.query.teamMember.findFirst({
				where: and(
					eq(teamMember.teamId, request.teamId),
					eq(teamMember.userId, leaderId),
					eq(teamMember.role, 'LEADER')
				)
			});

			if (!isLeader) {
				throw new Error('Only team leader can handle join requests');
			}

			// If accepting, check team size limits
			if (status === 'ACCEPTED') {
				// const currentTeamSize = request.team.members.length;
				// const hackathon = await db.query.hackathon.findFirst({
				// 	where: eq(team.hackathonId, request.team.hackathonId)
				// });
				// if (hackathon && currentTeamSize >= hackathon.maxTeamSize) {
				// 	throw new Error('Team is full');
				// }
			}

			return await db.transaction(async (tx) => {
				// Update request status
				await tx
					.update(teamJoinRequest)
					.set({
						status,
						updatedAt: new Date()
					})
					.where(eq(teamJoinRequest.id, requestId));

				// If accepted, add user to team
				if (status === 'ACCEPTED') {
					await tx.insert(teamMember).values({
						id: nanoid(),
						teamId: request.teamId,
						userId: request.userId,
						role: 'MEMBER',
						joinedAt: new Date()
					});
				}

				return request;
			});
		} catch (error) {
			console.error('Error handling join request:', error);
			throw new Error('An error occurred while handling the join request');
		}
	},

	// Get pending join requests for a team
	async getTeamJoinRequests(teamId: string, leaderId: string) {
		// Verify leader
		const isLeader = await db.query.teamMember.findFirst({
			where: and(
				eq(teamMember.teamId, teamId),
				eq(teamMember.userId, leaderId),
				eq(teamMember.role, 'LEADER')
			)
		});

		if (!isLeader) {
			throw new Error('Only team leader can view join requests');
		}

		return await db.query.teamJoinRequest.findMany({
			where: and(eq(teamJoinRequest.teamId, teamId), eq(teamJoinRequest.status, 'PENDING')),
			with: {
				user: true
			}
		});
	},

	async getLeaderTeamRequests(leaderId: string) {
		// First get all teams where user is leader
		const leaderTeams = await db.query.teamMember.findMany({
			where: and(eq(teamMember.userId, leaderId), eq(teamMember.role, 'LEADER')),
			with: {
				team: true
			}
		});

		// Get pending requests for all these teams
		const requests = await db.query.teamJoinRequest.findMany({
			where: and(
				eq(teamJoinRequest.status, 'PENDING'),
				inArray(
					teamJoinRequest.teamId,
					leaderTeams.map((lt) => lt.teamId)
				)
			),
			with: {
				user: true,
				team: true
			}
		});

		return requests;
	},
	// Kick member from team
	async kickMember(teamId: string, memberId: string, leaderId: string) {
		// Verify leader
		const isLeader = await db.query.teamMember.findFirst({
			where: and(
				eq(teamMember.teamId, teamId),
				eq(teamMember.userId, leaderId),
				eq(teamMember.role, 'LEADER')
			)
		});

		if (!isLeader) {
			throw new Error('Only team leader can kick members');
		}

		// Verify target is not the leader
		const targetMember = await db.query.teamMember.findFirst({
			where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, memberId))
		});

		if (!targetMember) {
			throw new Error('Member not found in team');
		}

		if (targetMember.role === 'LEADER') {
			throw new Error('Cannot kick team leader');
		}

		return await db
			.delete(teamMember)
			.where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, memberId)))
			.returning();
	},

	// Leave team
	async leaveTeam(teamId: string, userId: string) {
		const member = await db.query.teamMember.findFirst({
			where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId))
		});

		if (!member) {
			throw new Error('User is not a member of this team');
		}

		if (member.role === 'LEADER') {
			throw new Error('Team leader cannot leave the team');
		}

		return await db
			.delete(teamMember)
			.where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
			.returning();
	},

	// Delete team (only if you're the leader)
	async deleteTeam(teamId: string, userId: string) {
		const member = await db.query.teamMember.findFirst({
			where: and(
				eq(teamMember.teamId, teamId),
				eq(teamMember.userId, userId),
				eq(teamMember.role, 'LEADER')
			)
		});

		if (!member) {
			throw new Error('Only team leader can delete the team');
		}

		return await db.transaction(async (tx) => {
			// Delete all team members first
			await tx.delete(teamMember).where(eq(teamMember.teamId, teamId));

			// Then delete the team
			return await tx.delete(team).where(eq(team.id, teamId)).returning();
		});
	},

	// Get teams for a specific hackathon
	async getHackathonTeams(hackathonId: string) {
		return await db.query.team.findMany({
			where: eq(team.hackathonId, hackathonId),
			with: {
				members: {
					with: {
						user: true
					}
				}
			}
		});
	}
};
