import { hackathonService } from '$lib/server/db/hackathonService.js';
import { hackathonSchema } from '$lib/zodValidations/hackathonSchema.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const form = await superValidate(zod(hackathonSchema), {
		defaults: {
			name: '',
			description: '',
			startDate: new Date(),
			endDate: new Date(),
			minTeamSize: '1',
			maxTeamSize: '5',
			basePrize: '0',
			fundingType: 'FULLY_FUNDED' as 'FULLY_FUNDED' | 'CROWDFUNDED' | 'HYBRID',
			judgingCriteria: [{ name: 'Innovation', weight: 40 }],
			useAITopics: false
		}
	});

	return { form };
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(hackathonSchema));

		if (!form.valid) {
			console.log('Form validation failed:', {
				formData: form.data,
				allErrors: form.errors,
				criteriaErrors: form.errors.judgingCriteria
			});

			return {
				form,
				message: 'Please ensure all judging criteria have names and the weights total 100%'
			};
		}

		if (!event.locals.user?.id) return;

		try {
			await hackathonService.createHackathon({
				...form.data,
				minTeamSize: Number(form.data.minTeamSize),
				maxTeamSize: Number(form.data.maxTeamSize),
				status: 'DRAFT',
				organizerId: event.locals.user.id
			});

			return {
				form,
				message: 'Hackathon created successfully'
			};
		} catch (error) {
			console.error(error);
			return {
				form,
				message: 'Failed to create hackathon'
			};
		}
	}
};
