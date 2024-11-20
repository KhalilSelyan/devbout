<script lang="ts">
	import CreateHackathon from '$lib/components/CreateHackathon.svelte';

	let { data } = $props();
</script>

<CreateHackathon data={data.form} />
