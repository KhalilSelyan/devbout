import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { profileUpdateSchema, schema } from '$lib/zodValidations/userSchema';
import { superValidate } from 'sveltekit-superforms';
import { fail, redirect } from '@sveltejs/kit';
import { userService } from '$lib/server/db/userService';
import { route } from '$lib/ROUTES.js';
import { zod } from 'sveltekit-superforms/adapters';
import { trpcServer } from '$lib/server/server.js';
import { db } from '$lib/server/db/index.js';
import { createPageMetaTags } from '$lib/metaTags.js';

export const load = async (event) => {
	if (!event.locals.session) {
		redirect(307, route('/'));
	}
	const form = await superValidate(zod(profileUpdateSchema));
	const formdata = await superValidate(zod(schema));
	const userProfileData = await trpcServer.user.getProfile.ssr(event.locals.session.userId, event);
	const userContributions = await trpcServer.user.getContributions.ssr(event);
	const userHackathons = await trpcServer.hackathon.getUserHackathons.ssr(
		event.locals.session.userId,
		event
	);

	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, event.locals.session.userId)
	});

	const userRequests = await trpcServer.user.getUserRequests.ssr(
		{ address: currentUser?.walletAddress },
		event
	);
	const pageMetaTags = createPageMetaTags({
		title: 'Profile',
		description: 'Profile page for DevBout'
	});

	return {
		form,
		formdata,
		user: event.locals.user,
		userProfileData,
		userContributions,
		userRequests: userRequests,
		userHackathons,
		pageMetaTags: Object.freeze(pageMetaTags)
	};
};

export const actions = {
	profileUpdate: async ({ request, locals }) => {
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
	},
	updateUserInfo: async ({ request, locals }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!locals.user?.id) return fail(401, { form });

		try {
			console.log(form.data);
			await userService.updateUserInfo(locals.user.id, form.data);
			return { form };
		} catch (error) {
			console.error(error);
			return fail(500, { form, message: 'Failed to update user information' });
		}
	}
};
