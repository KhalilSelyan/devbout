import { z } from 'zod';

export const contributionSchema = z.object({
	amount: z.string().refine(
		(value) => {
			const numberValue = parseFloat(value);
			return (
				!isNaN(numberValue) &&
				value === numberValue.toFixed(Math.min(5, value.split('.')[1]?.length || 0))
			);
		},
		{
			message: 'Amount must be a string representing a number with a maximum of 5 decimal places'
		}
	),
	message: z.string().optional(),
	hackathonId: z.string().min(1)
});
