<script lang="ts">
	import HackathonDetails from '$lib/components/HackathonDetails.svelte';

	let { data } = $props();
</script>

<HackathonDetails hackathon={data.hackathon} />
