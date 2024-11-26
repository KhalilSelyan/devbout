import { eq } from 'drizzle-orm';
import { db } from './index';
import { submission } from './schema';
import { nanoid } from 'nanoid';

type SubmissionCreateInput = Omit<typeof submission.$inferInsert, 'id'>;

export const submissionService = {
	async createSubmission(submissionData: SubmissionCreateInput) {
		return await db
			.insert(submission)
			.values({
				...submissionData,
				id: nanoid() // Use provided ID or generate new
			})
			.returning();
	},

	async getSubmissionsByHackathonId(hackathonId: string) {
		return await db.select().from(submission).where(eq(submission.hackathonId, hackathonId));
	},

	async getSubmissionById(id: string) {
		const result = await db.select().from(submission).where(eq(submission.id, id)).limit(1);
		return result[0] || null;
	}
};
