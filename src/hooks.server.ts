import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export async function handle({ event, resolve }) {
	// Get session before handling the request
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Add session and user to locals
	event.locals.session = session?.session;
	event.locals.user = session?.user;

	return svelteKitHandler({ event, resolve, auth });
}
