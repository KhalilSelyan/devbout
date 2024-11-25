import { z } from 'zod';

export const teamSchema = z.object({
	id: z.string().optional(),
	hackathonId: z.string(),
	name: z.string().min(3, 'Team name must be at least 3 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters')
});

export const teamJoinRequestSchema = z.object({
	teamId: z.string(),
	message: z.string().optional()
});
