import { hackathonService } from '$lib/server/db/hackathonService';
import { teamService } from '$lib/server/db/teamService';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { route } from '$lib/ROUTES';
import { teamSchema, teamJoinRequestSchema } from '$lib/zodValidations/teamSchema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { submissionSchema } from '$lib/zodValidations/submissionSchema';
import { submissionService } from '$lib/server/db/submissionService';
import { contributionSchema } from '$lib/zodValidations/contributionSchema';
import { createPageMetaTags } from '$lib/metaTags';

export const load = (async ({ params, locals }) => {
	const hackathonDetails = await hackathonService.getHackathonDetails(params.id);
	const teams = await teamService.getHackathonTeams(params.id);
	const userHackathons = await hackathonService.getUserHackathons(locals.user?.id);

	if (
		!hackathonDetails ||
		(hackathonDetails.status === 'DRAFT' && hackathonDetails.organizerId !== locals.user?.id)
	)
		redirect(307, route('/hackathons'));
	// Create forms with initial data
	const createTeamForm = await superValidate(zod(teamSchema));
	const joinRequestForm = await superValidate(zod(teamJoinRequestSchema));

	const pageMetaTags = createPageMetaTags({
		title: `${hackathonDetails.name}`,
		description: `${hackathonDetails.name} Hackathon page for DevBout`
	});

	return {
		hackathon: hackathonDetails,
		teams,
		userHackathons,
		createTeamForm,
		joinRequestForm,
		pageMetaTags: Object.freeze(pageMetaTags)
	};
}) satisfies PageServerLoad;

export const actions = {
	createTeam: async (event) => {
		const form = await superValidate(event, zod(teamSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!event.locals.user) return fail(401, { form });

		try {
			await teamService.createTeam(form.data, event.locals.user.id);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: 'Failed to create team' });
		}
	},

	joinTeam: async (event) => {
		const form = await superValidate(event, zod(teamJoinRequestSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!event.locals.user) return fail(401, { form });
		try {
			await teamService.requestToJoinTeam(
				form.data.teamId,
				event.locals.user.id,
				form.data.hackathonId,
				form.data.message
			);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: 'Failed to submit join request' });
		}
	},
	createSubmission: async (event) => {
		const form = await superValidate(event, zod(submissionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!event.locals.user) return fail(401, { form });

		try {
			await submissionService.createSubmission({
				...form.data,
				score: form.data.score?.toString()
			});

			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: 'Failed to submit project' });
		}
	},
	createContribution: async (event) => {
		const form = await superValidate(event, zod(contributionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!event.locals.user) return fail(401, { form });

		try {
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: 'Failed to create contribution' });
		}
	}
};
