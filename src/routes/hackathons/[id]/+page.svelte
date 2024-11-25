<script lang="ts">
	import HackathonDetails from '$lib/components/HackathonDetails.svelte';

	let { data } = $props();
</script>

<HackathonDetails user={data.user} hackathon={data.hackathon} teams={data.teams} />
