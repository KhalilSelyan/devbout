<script lang="ts">
	import type { PageData } from './$types';
	import HackathonExplorer from '$lib/components/HackathonExplorer.svelte';
	let { data }: { data: PageData } = $props();
</script>

<HackathonExplorer />
