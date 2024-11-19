import { betterAuth } from 'better-auth';
import { db } from './db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import * as schema from './db/schema';
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID!,
			clientSecret: GOOGLE_CLIENT_SECRET!
		}
	}
});
