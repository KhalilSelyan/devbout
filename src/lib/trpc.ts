import { createTRPCSvelte } from 'trpc-svelte-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { type AppRouter } from '$lib/types/router';
import { parse, stringify, uneval } from 'devalue';

export const transformer = {
	input: {
		serialize: (object: unknown) => stringify(object),
		deserialize: (object: string) => parse(object)
	},
	output: {
		serialize: (object: unknown) => uneval(object),
		deserialize: (object: string) => (0, eval)(`(${object})`)
	}
};

export const trpc = createTRPCSvelte<AppRouter>({
	links: [
		loggerLink({
			enabled: (op) =>
				process.env.NODE_ENV === 'development' ||
				(op.direction === 'down' && op.result instanceof Error)
		}),
		httpBatchLink({
			url: '/api/trpc'
		})
	],
	transformer
});
