<script lang="ts">
	import { setupViewTransition } from 'sveltekit-view-transition';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';

	setupViewTransition();
	let { children, data } = $props();
</script>

<div>
	<Header session={data.session} user={data.user} />
	{@render children()}
	<Footer />
</div>

<style>
	/* Disable default crossfade. */
	:root {
		view-transition-name: 'header';
	}

	/* Or, just modify the duration. */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: 0.5s;
	}
</style>
