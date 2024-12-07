<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import { trpc } from '$lib/trpc';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { setupViewTransition } from 'sveltekit-view-transition';
	import extend from 'just-extend';
	import { MetaTags } from 'svelte-meta-tags';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { page } from '$app/stores';

	setupViewTransition();
	let metaTags = $state({});
	$effect(() => {
		metaTags = extend(true, {}, data.baseMetaTags, $page.data.pageMetaTags);
	});
	let { children, data } = $props();
	let queryClient = trpc.hydrateFromServer(data.trpc);
</script>

<MetaTags {...metaTags} />

<div>
	<Toaster richColors position="bottom-right" />
	<QueryClientProvider client={queryClient}>
		<Header user={data.user} />
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
