import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load = (async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});
	if (!session) {
		return {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				error: 'Unauthorized'
			})
		};
	}
	return session;
}) satisfies LayoutServerLoad;
