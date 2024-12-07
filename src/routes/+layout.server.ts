import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { trpcServer } from '$lib/server/server';
import { createBaseMetaTags } from '$lib/metaTags';

export const load = (async (event) => {
	const baseMetaTags = createBaseMetaTags(event.url);
	const session = await auth.api.getSession({
		headers: event.request.headers
	});
	const trpc = await trpcServer.hydrateToClient(event);

	if (!session) {
		return {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				error: 'Unauthorized'
			}),
			trpc,
			baseMetaTags: Object.freeze(baseMetaTags)
		};
	}

	return {
		session: session.session,
		user: session.user,
		trpc,
		baseMetaTags: Object.freeze(baseMetaTags)
	};
}) satisfies LayoutServerLoad;
