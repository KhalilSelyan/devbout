import { submissionService } from '$lib/server/db/submissionService';
import { authedProcedure, router } from '$lib/server/trpc';
import { submissionSchema } from '$lib/zodValidations/submissionSchema';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const submissionRouter = router({
	createSubmission: authedProcedure.input(submissionSchema).mutation(async ({ input }) => {
		return await submissionService.createSubmission({ ...input, score: input.score?.toString() });
	}),

	getSubmissionsByHackathonId: authedProcedure.input(z.string()).query(async ({ input }) => {
		return await submissionService.getSubmissionsByHackathonId(input);
	}),

	getSubmissionById: authedProcedure.input(z.string()).query(async ({ input }) => {
		const submission = await submissionService.getSubmissionById(input);
		if (!submission) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
		}
		return submission;
	})
});
