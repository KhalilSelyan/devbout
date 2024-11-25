<script lang="ts">
	import { X, Plus } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

	let {
		initialSkills,
		onChange
	}: {
		initialSkills: Record<string, string> | undefined;
		onChange: (skills: Record<string, string>) => void;
	} = $props();

	let skills = $state({ ...initialSkills });
	let newSkill = $state('');
	let newLevel = $state('Beginner');

	const proficiencyLevels = $state(['Beginner', 'Intermediate', 'Advanced', 'Expert']);

	function addSkill() {
		if (newSkill.trim()) {
			skills = {
				...skills,
				[newSkill.trim()]: newLevel
			};
			onChange(skills);
			newSkill = '';
			newLevel = 'Beginner';
		}
	}

	function removeSkill(skillName: string) {
		const { [skillName]: _, ...remainingSkills } = skills;
		skills = remainingSkills;
		onChange(skills);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addSkill();
		}
	}
</script>

<div class="space-y-4">
	<!-- Display existing skills -->
	<div class="flex flex-wrap gap-2">
		{#each Object.entries(skills) as [skill, level]}
			<Badge variant="default" class="flex items-center gap-2 text-primary-foreground">
				<span>{skill}</span>
				<span>•</span>
				<span>{level}</span>
				<Button
					variant="ghost"
					size="icon"
					class="h-4 w-4 p-0 hover:bg-transparent"
					onclick={() => removeSkill(skill)}
				>
					<X class="h-3 w-3" />
				</Button>
			</Badge>
		{/each}
	</div>

	<!-- Add new skill -->
	<div class="flex gap-2">
		<Input
			type="text"
			bind:value={newSkill}
			placeholder="Add a skill..."
			onkeydown={handleKeydown}
		/>

		<Select type="single" bind:value={newLevel}>
			<SelectTrigger class="w-[180px]">
				{newLevel}
			</SelectTrigger>
			<SelectContent>
				{#each proficiencyLevels as level}
					<SelectItem value={level}>{level}</SelectItem>
				{/each}
			</SelectContent>
		</Select>

		<Button type="button" onclick={addSkill}>
			<Plus class="h-4 w-4" />
		</Button>
	</div>
</div>
