<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Loader2 } from 'lucide-svelte';
	import ShadowSpinner from './ShadowSpinner.svelte';

	let {
		isOpen,
		title,
		currentStep,
		progress,
		error,
		canCancel,
		timeEstimate,
		transactionHash,
		onCancel,
		onRetry
	}: {
		isOpen: boolean;
		title: string;
		currentStep: string;
		progress: number;
		error: string | null;
		canCancel: boolean;
		timeEstimate: string | null;
		transactionHash: string | null;
		onCancel?: (() => void) | null;
		onRetry?: (() => void) | null;
	} = $props();

	let showCancel = $derived(canCancel && onCancel);
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full"
		>
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						{#if !error}
							<ShadowSpinner size={36} />
						{/if}
						{title}
					</CardTitle>
				</CardHeader>

				<CardContent class="grid gap-4">
					{#if !error}
						<div class="space-y-4">
							<Progress value={progress} />

							<div class="text-sm text-muted-foreground">
								{currentStep}
							</div>

							{#if timeEstimate}
								<div class="text-xs text-muted-foreground">
									Estimated time: {timeEstimate}
								</div>
							{/if}

							{#if transactionHash}
								<div class="text-xs">
									Transaction:
									<a
										href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
										target="_blank"
										rel="noopener noreferrer"
										class="text-primary hover:underline"
									>
										View on Etherscan
									</a>
								</div>
							{/if}
						</div>
					{:else}
						<Alert variant="destructive">
							<AlertDescription>
								{error}
							</AlertDescription>
						</Alert>
					{/if}
				</CardContent>

				<CardFooter class="flex justify-end gap-2">
					{#if error && onRetry}
						<Button variant="outline" onclick={onRetry}>Try Again</Button>
					{/if}

					{#if showCancel}
						<Button variant="ghost" onclick={onCancel} disabled={!canCancel}>Cancel</Button>
					{/if}
				</CardFooter>
			</Card>
		</div>
	</div>
{/if}
