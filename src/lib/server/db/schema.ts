import { relations } from 'drizzle-orm';
import {
	pgTable,
	text,
	timestamp,
	boolean,
	pgEnum,
	json,
	integer,
	index
} from 'drizzle-orm/pg-core';
// PostgreSQL Enums
export const fundingTypeEnum = pgEnum('funding_type', ['FULLY_FUNDED', 'CROWDFUNDED', 'HYBRID']);
export const hackathonStatusEnum = pgEnum('hackathon_status', [
	'DRAFT',
	'OPEN',
	'ONGOING',
	'COMPLETED'
]);
export const teamMemberRoleEnum = pgEnum('team_member_role', ['LEADER', 'MEMBER']);

export const user = pgTable(
	'user',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: boolean('emailVerified').notNull(),
		image: text('image'),
		createdAt: timestamp('createdAt').notNull(),
		updatedAt: timestamp('updatedAt').notNull(),
		// Additional user fields for the platform
		walletAddress: text('walletAddress'),
		bio: text('bio'),
		skills: json('skills').$type<Record<string, string>>(),
		xpPoints: integer('xpPoints').default(0)
	},
	(table) => ({
		emailIdx: index('email_idx').on(table.email)
	})
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	organizedHackathons: many(hackathon),
	teamMemberships: many(teamMember),
	prizeContributions: many(prizePool),
	badges: many(userBadge)
}));

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => user.id)
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	expiresAt: timestamp('expiresAt'),
	password: text('password')
});

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt')
});

// New tables for the hackathon platform
export const hackathon = pgTable(
	'hackathon',
	{
		id: text('id').primaryKey(),
		organizerId: text('organizerId')
			.notNull()
			.references(() => user.id),
		name: text('name').notNull(),
		description: text('description').notNull(),
		startDate: timestamp('startDate').notNull(),
		endDate: timestamp('endDate').notNull(),
		minTeamSize: integer('minTeamSize').default(1),
		maxTeamSize: integer('maxTeamSize').notNull(),
		prizePool: text('prizePool').default('0'),
		basePrize: text('basePrize').default('0'),
		fundingType: fundingTypeEnum('fundingType').notNull(),
		status: hackathonStatusEnum('status').notNull().default('DRAFT'),
		judgingCriteria: json('judgingCriteria').$type<{ name: string; weight: number }[]>(),
		aiGeneratedTopics: json('aiGeneratedTopics').$type<string[]>(),
		createdAt: timestamp('createdAt').notNull().defaultNow(),
		updatedAt: timestamp('updatedAt').notNull().defaultNow()
	},
	(table) => ({
		statusIdx: index('status_idx').on(table.status)
	})
);

export const hackathonRelations = relations(hackathon, ({ one, many }) => ({
	organizer: one(user, {
		fields: [hackathon.organizerId],
		references: [user.id]
	}),
	teams: many(team),
	submissions: many(submission),
	prizeContributions: many(prizePool)
}));

export const team = pgTable('team', {
	id: text('id').primaryKey(),
	hackathonId: text('hackathonId')
		.notNull()
		.references(() => hackathon.id),
	name: text('name').notNull(),
	description: text('description'),
	xpPoints: integer('xpPoints').default(0),
	createdAt: timestamp('createdAt').notNull().defaultNow()
});

export const teamRelations = relations(team, ({ one, many }) => ({
	hackathon: one(hackathon, {
		fields: [team.hackathonId],
		references: [hackathon.id]
	}),
	members: many(teamMember),
	submissions: many(submission)
}));

export const teamMember = pgTable('teamMember', {
	id: text('id').primaryKey(),
	teamId: text('teamId')
		.notNull()
		.references(() => team.id),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	role: teamMemberRoleEnum('role').notNull(),
	joinedAt: timestamp('joinedAt').notNull().defaultNow()
});

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id]
	})
}));

export const submission = pgTable('submission', {
	id: text('id').primaryKey(),
	hackathonId: text('hackathonId')
		.notNull()
		.references(() => hackathon.id),
	teamId: text('teamId')
		.notNull()
		.references(() => team.id),
	projectName: text('projectName').notNull(),
	description: text('description').notNull(),
	submissionUrl: text('submissionUrl'),
	githubUrl: text('githubUrl'),
	score: text('score'),
	submittedAt: timestamp('submittedAt').notNull().defaultNow()
});

export const submissionRelations = relations(submission, ({ one }) => ({
	hackathon: one(hackathon, {
		fields: [submission.hackathonId],
		references: [hackathon.id]
	}),
	team: one(team, {
		fields: [submission.teamId],
		references: [team.id]
	})
}));

export const prizePool = pgTable('prizePool', {
	id: text('id').primaryKey(),
	hackathonId: text('hackathonId')
		.notNull()
		.references(() => hackathon.id),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	amount: text('amount').notNull(),
	transactionHash: text('transactionHash'),
	contributedAt: timestamp('contributedAt').notNull().defaultNow()
});

export const prizePoolRelations = relations(prizePool, ({ one }) => ({
	hackathon: one(hackathon, {
		fields: [prizePool.hackathonId],
		references: [hackathon.id]
	}),
	contributor: one(user, {
		fields: [prizePool.userId],
		references: [user.id]
	})
}));

export const badge = pgTable(
	'badge',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description'),
		imageUrl: text('imageUrl')
	},
	(table) => ({
		nameIdx: index('badge_name_idx').on(table.name)
	})
);

export const badgeRelations = relations(badge, ({ many }) => ({
	users: many(userBadge)
}));

export const userBadge = pgTable('userBadge', {
	id: text('id').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	badgeId: text('badgeId')
		.notNull()
		.references(() => badge.id),
	earnedAt: timestamp('earnedAt').notNull().defaultNow()
});

export const userBadgeRelations = relations(userBadge, ({ one }) => ({
	user: one(user, {
		fields: [userBadge.userId],
		references: [user.id]
	}),
	badge: one(badge, {
		fields: [userBadge.badgeId],
		references: [badge.id]
	})
}));
