<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { User } from 'better-auth';

	let { user }: { user: User } = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>Your Contributions</CardTitle>
	</CardHeader>
	<CardContent></CardContent>
</Card>
