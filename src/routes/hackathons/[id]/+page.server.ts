import { hackathonService } from '$lib/server/db/hackathonService';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { route } from '$lib/ROUTES';

export const load = (async ({ params }) => {
	const hackathonDetails = await hackathonService.getHackathonDetails(params.id);
	if (!hackathonDetails) redirect(307, route('/hackathons'));
	return {
		hackathon: hackathonDetails
	};
}) satisfies PageServerLoad;
