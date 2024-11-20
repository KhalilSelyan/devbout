import type { hackathon } from '$lib/server/db/schema';
import { trpcServer } from '$lib/server/server';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const hackathons = (await trpcServer.hackathon.getHackathons.ssr(undefined, event)) as Array<
		typeof hackathon.$inferSelect
	>;
	return { hackathons };
}) satisfies PageServerLoad;
