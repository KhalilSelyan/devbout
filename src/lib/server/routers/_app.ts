import { router } from '$lib/server/trpc';
import { hackathonRouter } from './hackathon';

export const appRouter = router({
	hackathon: hackathonRouter
});

export type AppRouter = typeof appRouter;
