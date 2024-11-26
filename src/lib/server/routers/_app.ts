import { router } from '$lib/server/trpc';
import { hackathonRouter } from './hackathon';
import { submissionRouter } from './submission';
import { teamRouter } from './team';
import { userRouter } from './user';

export const appRouter = router({
	hackathon: hackathonRouter,
	team: teamRouter,
	user: userRouter,
	submission: submissionRouter
});

export type AppRouter = typeof appRouter;
