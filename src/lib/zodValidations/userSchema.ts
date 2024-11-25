import { z } from 'zod';

export const profileUpdateSchema = z.object({
	bio: z.string().max(500).optional(),
	githubUsername: z.string().max(39).optional(),
	discord: z.string().max(32).optional(),
	image: z.string().url().optional(),
	skills: z.record(z.string()).optional()
});
