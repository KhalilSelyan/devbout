<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import { trpc } from '$lib/trpc';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { setupViewTransition } from 'sveltekit-view-transition';

	import '../app.css';

	setupViewTransition();

	let { children, data } = $props();
	let queryClient = trpc.hydrateFromServer(data.trpc);
</script>

<div>
	<QueryClientProvider client={queryClient}>
		<Header session={data.session} user={data.user} />
		{@render children()}
		<Footer />
	</QueryClientProvider>
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
