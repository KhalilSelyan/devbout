<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { trpcServer } from '$lib/server/server';
	import { trpc } from '$lib/trpc';
	import type { profileUpdateSchema, schema } from '$lib/zodValidations/userSchema';
	import type { inferAsyncReturnType } from '@trpc/server';
	import type { User } from 'better-auth';
	import { type Infer, type SuperValidated } from 'sveltekit-superforms';
	import ContributionsTab from './profile/ContributionsTab.svelte';
	import OverviewTab from './profile/OverviewTab.svelte';
	import SettingsTab from './profile/SettingsTab.svelte';
	import TeamsTab from './profile/TeamsTab.svelte';
	import UserInfoTab from './profile/UserInfoTab.svelte';

	let { user, form, formdata, userProfileData } = $props<{
		user: User | undefined;
		form: SuperValidated<Infer<typeof profileUpdateSchema>>;
		formdata: SuperValidated<Infer<typeof schema>>;
		userProfileData: inferAsyncReturnType<typeof trpcServer.user.getProfile.ssr>;
	}>();

	// Load user's profile data
	let userProfile = trpc.user.getProfile.query(user.id, { initialData: userProfileData });
</script>

<main class="container mx-auto min-h-[calc(100dvh-11rem)] py-6">
	<div class="mb-6">
		<div class="flex items-center space-x-4">
			<Avatar class="h-20 w-20">
				<AvatarImage src={user.image} alt={user.name} />
				<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
			</Avatar>
			<div>
				<h1 class="text-2xl font-bold">{user.name}</h1>
				<p class="text-muted-foreground">{$userProfile.data?.bio || 'No bio yet'}</p>
			</div>
		</div>
	</div>

	<Tabs value="overview" class="space-y-4">
		<TabsList>
			<TabsTrigger value="overview">Overview</TabsTrigger>
			<TabsTrigger value="teams">Teams</TabsTrigger>
			<TabsTrigger value="contributions">Contributions</TabsTrigger>
			<TabsTrigger value="info">User Info</TabsTrigger>
			<TabsTrigger value="settings">Settings</TabsTrigger>
		</TabsList>

		<TabsContent value="overview">
			<OverviewTab userProfileData={$userProfile.data} />
		</TabsContent>
		<TabsContent value="teams">
			<TeamsTab {user} />
		</TabsContent>
		<TabsContent value="contributions">
			<ContributionsTab {user} />
		</TabsContent>
		<TabsContent value="info">
			<UserInfoTab {formdata} />
		</TabsContent>
		<TabsContent value="settings">
			<SettingsTab {form} {user} />
		</TabsContent>
	</Tabs>
</main>
