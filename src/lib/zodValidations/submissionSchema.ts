import { z } from 'zod';

export const submissionSchema = z.object({
	hackathonId: z.string().min(1),
	description: z.string().min(1).max(1000),
	teamId: z.string().min(1),
	projectName: z.string().min(3, { message: 'Project name must be at least 3 characters long' }),
	title: z.string().min(1).max(100),
	githubUrl: z.string().url().optional(),
	submissionUrl: z.string().url().optional(),
	score: z.number().gt(0, { message: 'Should be Non-negative value' }).optional()
});

export type SubmissionSchema = typeof submissionSchema;
export type Submission = z.infer<typeof submissionSchema>;
