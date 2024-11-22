import { hackathonService } from '$lib/server/db/hackathonService';
import { trpcServer } from '$lib/server/server';
import { hackathonSchema } from '$lib/zodValidations/hackathonSchema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const hackathons = await trpcServer.hackathon.getHackathons.ssr(undefined, event);

	const form = await superValidate(zod(hackathonSchema), {
		defaults: {
			name: '',
			description: '',
			startDate: new Date(),
			endDate: new Date(),
			minTeamSize: '1',
			maxTeamSize: '5',
			basePrize: '0',
			status: 'DRAFT' as 'DRAFT' | 'OPEN' | 'ONGOING' | 'COMPLETED',
			fundingType: 'FULLY_FUNDED' as 'FULLY_FUNDED' | 'CROWDFUNDED' | 'HYBRID',
			judgingCriteria: [{ name: 'Innovation', weight: 40 }],
			useAITopics: false
		}
	});
	return { hackathons, form };
}) satisfies PageServerLoad;

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
				prizePool: form.data.basePrize,
				minTeamSize: Number(form.data.minTeamSize),
				maxTeamSize: Number(form.data.maxTeamSize),
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
