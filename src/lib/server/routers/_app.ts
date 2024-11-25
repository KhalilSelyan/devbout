import { router } from '$lib/server/trpc';
import { hackathonRouter } from './hackathon';
import { teamRouter } from './team';
import { userRouter } from './user';

export const appRouter = router({
	hackathon: hackathonRouter,
	team: teamRouter,
	user: userRouter
});

export type AppRouter = typeof appRouter;
