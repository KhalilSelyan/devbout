import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import { db } from '$lib/server/db';

export async function createContext(event: RequestEvent) {
	return {
		db,
		user: event.locals.user,
		session: event.locals.session
	};
}

export type Context = inferAsyncReturnType<typeof createContext>;
