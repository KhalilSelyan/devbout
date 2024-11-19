<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	let { children, data } = $props();
</script>

<div>
	<Header session={data.session} user={data.user} />
	{@render children()}
	<Footer />
</div>
