import { z } from 'zod';

export const hackathonSchema = z
	.object({
		hackathonid: z.string().min(1),
		name: z
			.string()
			.trim()
			.min(3, { message: 'Hackathon name must be at least 3 characters long' }),
		description: z
			.string()
			.trim()
			.min(10, { message: 'Description must be at least 10 characters long' }),
		startDate: z.date(),
		endDate: z.date(),
		minTeamSize: z.string().min(1, { message: 'Minimum team size must be at least 1' }),
		maxTeamSize: z.string().min(1, { message: 'Maximum team size must be at least 1' }),
		// .refine((max) => Number(max) >= 1, {
		// 	message: 'Maximum team size must be greater than or equal to minimum team size'
		// }),
		status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'JUDGING', 'COMPLETED'], {
			errorMap: () => ({ message: 'Invalid status type selected' })
		}),
		currencyType: z.enum(['ERC20', 'ETH'], {
			errorMap: () => ({ message: 'Invalid payment type selected' })
		}),
		basePrize: z.string().refine(
			(value) => {
				const numberValue = parseFloat(value);
				return (
					!isNaN(numberValue) &&
					value === numberValue.toFixed(Math.min(5, value.split('.')[1]?.length || 0))
				);
			},
			{
				message:
					'Base prize must be a string representing a number with a maximum of 5 decimal places'
			}
		),
		fundingType: z.enum(['FULLY_FUNDED', 'CROWDFUNDED', 'HYBRID'], {
			errorMap: () => ({ message: 'Invalid funding type selected' })
		}),
		judgingCriteria: z
			.array(
				z.object({
					name: z.string().trim().min(1, 'Criterion name is required'),
					weight: z.number().int().min(0).max(100, 'Weight must be between 0 and 100')
				})
			)
			.min(1, 'At least one judging criterion is required')
			.refine((criteria) => criteria.reduce((sum, c) => sum + c.weight, 0) <= 100, {
				message: 'Total weight of criteria cannot exceed 100%'
			}),
		useAITopics: z.boolean()
	})
	.refine((data) => data.maxTeamSize >= data.minTeamSize, {
		message: 'Maximum team size must be greater than or equal to minimum team size',
		path: ['maxTeamSize']
	});
