import { db } from './index';
import { hackathon, type hackathonStatusEnum, type fundingTypeEnum } from './schema';
import { eq, sql, and, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

type HackathonCreateInput = Omit<typeof hackathon.$inferInsert, 'id'>;
type HackathonUpdateInput = Partial<HackathonCreateInput>;

export const hackathonService = {
	// Create a new hackathon
	async createHackathon(data: HackathonCreateInput) {
		return await db
			.insert(hackathon)
			.values({
				...data,
				id: nanoid(), // Use provided ID or generate new
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning();
	},

	// Get hackathons with flexible filtering
	async getHackathons(
		filters: {
			status?: (typeof hackathonStatusEnum.enumValues)[number];
			fundingType?: (typeof fundingTypeEnum.enumValues)[number];
			minPrizePool?: string;
			organizerId?: string;
		} = {}
	) {
		const whereConditions = and(
			filters.status ? eq(hackathon.status, filters.status) : undefined,
			filters.fundingType ? eq(hackathon.fundingType, filters.fundingType) : undefined,
			filters.organizerId ? eq(hackathon.organizerId, filters.organizerId) : undefined,
			filters.minPrizePool
				? sql`CAST(${hackathon.prizePool} AS NUMERIC) >= CAST(${filters.minPrizePool} AS NUMERIC)`
				: undefined
		);

		return await db.select().from(hackathon).where(whereConditions).orderBy(hackathon.createdAt);
	},

	// Get detailed hackathon information including teams and submissions
	async getHackathonDetails(hackathonId: string) {
		const hackathonDetails = await db.query.hackathon.findFirst({
			where: eq(hackathon.id, hackathonId),
			with: {
				organizer: true,
				teams: {
					with: {
						members: {
							with: {
								user: true
							}
						},
						submissions: true
					}
				},
				submissions: true,
				prizeContributions: {
					with: {
						contributor: {
							with: { badges: true }
						}
					}
				}
			}
		});

		return hackathonDetails;
	},

	// Update hackathon details
	async updateHackathon(hackathonId: string, data: HackathonUpdateInput) {
		return await db
			.update(hackathon)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(hackathon.id, hackathonId))
			.returning();
	},

	// Update hackathon status
	async updateHackathonStatus(
		hackathonId: string,
		newStatus: (typeof hackathonStatusEnum.enumValues)[number]
	) {
		return await db
			.update(hackathon)
			.set({
				status: newStatus,
				updatedAt: new Date()
			})
			.where(eq(hackathon.id, hackathonId))
			.returning();
	},

	// Count ongoing and upcoming hackathons
	async getHackathonCounts() {
		const counts = await db
			.select({
				status: hackathon.status,
				count: sql<number>`COUNT(*)`.as('count')
			})
			.from(hackathon)
			.where(or(eq(hackathon.status, 'ONGOING'), eq(hackathon.status, 'OPEN')))
			.groupBy(hackathon.status);

		return counts;
	},

	// Get hackathons with AI-generated topics
	async getHackathonsWithAITopics() {
		return await db
			.select()
			.from(hackathon)
			.where(sql`jsonb_array_length(${hackathon.aiGeneratedTopics}) > 0`)
			.orderBy(hackathon.createdAt);
	}
};
