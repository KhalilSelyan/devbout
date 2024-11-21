import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { route } from '$lib/ROUTES';

export const load = (async ({ locals }) => {
	if (!locals.session) {
		redirect(307, route('/'));
	}

	return {};
}) satisfies PageServerLoad;
