import { profileUpdateSchema, schema } from '$lib/zodValidations/userSchema';
import { superValidate } from 'sveltekit-superforms';
import { fail, redirect } from '@sveltejs/kit';
import { userService } from '$lib/server/db/userService';
import { route } from '$lib/ROUTES.js';
import { zod } from 'sveltekit-superforms/adapters';
import { trpcServer } from '$lib/server/server.js';

export const load = async (event) => {
	if (!event.locals.session) {
		redirect(307, route('/'));
	}
	const form = await superValidate(zod(profileUpdateSchema));
	const formdata = await superValidate(zod(schema));
	const userProfileData = await trpcServer.user.getProfile.ssr(event.locals.session.userId, event);

	return {
		form,
		formdata,
		user: event.locals.user,
		userProfileData
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(profileUpdateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!locals.user?.id) return fail(401, { form });

		try {
			await userService.updateUserProfile(locals.user.id, form.data);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: 'Failed to update profile' });
		}
	}
};
