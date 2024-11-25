<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { profileUpdateSchema } from '$lib/zodValidations/userSchema';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import SkillInput from '../SkillInput.svelte';
	import { zod } from 'sveltekit-superforms/adapters';
	import { trpc } from '$lib/trpc';
	import type { User } from 'better-auth';

	let { form, user }: { form: SuperValidated<Infer<typeof profileUpdateSchema>>; user: User } =
		$props();

	// Form handling
	const { enhance, form: superform } = superForm(form, {
		dataType: 'json',
		validators: zod(profileUpdateSchema),
		resetForm: true,
		onUpdated: ({ form }) => {
			if (form.valid) {
				trpc.user.getProfile.utils.invalidate(user.id);
				$superform.skills = {};
			}
		}
	});

	function handleSkillsChange(skills: Record<string, string>) {
		$superform.skills = skills;
	}
</script>

<Card>
	<CardHeader>
		<CardTitle>Profile Settings</CardTitle>
		<CardDescription>Update your profile information</CardDescription>
	</CardHeader>
	<CardContent>
		<form class="space-y-4" use:enhance method="POST">
			<div class="space-y-2">
				<label for="bio">Bio</label>
				<Textarea
					id="bio"
					name="bio"
					bind:value={$superform.bio}
					placeholder="Tell us about yourself"
				/>
			</div>
			<div class="space-y-2">
				<label for="githubUsername">GitHub Username</label>
				<Input
					id="githubUsername"
					name="githubUsername"
					bind:value={$superform.githubUsername}
					placeholder="Your GitHub username"
				/>
			</div>
			<div class="space-y-2">
				<label for="discord">Discord Username</label>
				<Input
					id="discord"
					name="discord"
					bind:value={$superform.discord}
					placeholder="Your Discord username"
				/>
			</div>

			<div class="space-y-2">
				<label for="skills">Skills</label>
				<SkillInput initialSkills={$superform.skills} onChange={handleSkillsChange} />

				<input type="hidden" name="skills" value={JSON.stringify($superform.skills || {})} />
			</div>
			<Button type="submit">Save Changes</Button>
		</form>
	</CardContent>
</Card>
