<script lang="ts">
	import { schema } from '$lib/zodValidations/userSchema';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms/client';
	import { Label } from '../ui/label';
	import { Input } from '../ui/input';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
	import { route } from '$lib/ROUTES';
	import { Button } from '../ui/button';

	// Get the form data from the page load
	let {
		formdata
	}: {
		formdata: SuperValidated<Infer<typeof schema>>;
	} = $props();

	// Initialize Superforms
	const { form, errors, enhance, delayed, message } = superForm(formdata, {
		dataType: 'json',
		validators: zod(schema),
		resetForm: true
	});
</script>

<Card>
	<CardHeader>
		<CardTitle>User Info</CardTitle>
		<CardDescription>Update your user information</CardDescription>
	</CardHeader>
	<CardContent>
		<form
			method="POST"
			use:enhance
			action={route('updateUserInfo /profile')}
			class="flex flex-col gap-2"
		>
			{#if $message}
				<div class="rounded-md bg-muted p-4 text-muted-foreground">
					{$message}
				</div>
			{/if}

			<div class="space-y-4">
				<!-- Personal Information -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label class="block text-sm font-medium text-muted-foreground" for="firstName"
							>First Name</Label
						>
						<Input
							type="text"
							id="firstName"
							name="firstName"
							bind:value={$form.firstName}
							class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
            {$errors.firstName ? 'border-red-500' : 'border-gray-300'}"
						/>
						{#if $errors.firstName}
							<p class="mt-1 text-sm text-red-500">{$errors.firstName}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label class="block text-sm font-medium text-muted-foreground" for="lastName"
							>Last Name</Label
						>
						<Input
							type="text"
							id="lastName"
							name="lastName"
							bind:value={$form.lastName}
							class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
            {$errors.lastName ? 'border-red-500' : 'border-gray-300'}"
						/>
						{#if $errors.lastName}
							<p class="mt-1 text-sm text-red-500">{$errors.lastName}</p>
						{/if}
					</div>
				</div>

				<!-- Business Information -->
				<div class="space-y-2">
					<Label class="block text-sm font-medium text-muted-foreground" for="businessName">
						Business Name
					</Label>
					<Input
						type="text"
						id="businessName"
						name="businessName"
						bind:value={$form.businessName}
						class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
          {$errors.businessName ? 'border-red-500' : 'border-gray-300'}"
					/>
					{#if $errors.businessName}
						<p class="mt-1 text-sm text-red-500">{$errors.businessName}</p>
					{/if}
				</div>

				<!-- Contact Information -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label class="block text-sm font-medium text-muted-foreground" for="email">Email</Label>
						<Input
							type="email"
							id="email"
							name="email"
							bind:value={$form.email}
							class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
            {$errors.email ? 'border-red-500' : 'border-gray-300'}"
						/>
						{#if $errors.email}
							<p class="mt-1 text-sm text-red-500">{$errors.email}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label class="block text-sm font-medium text-muted-foreground" for="phone">Phone</Label>
						<Input
							type="tel"
							id="phone"
							name="phone"
							bind:value={$form.phone}
							class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
            {$errors.phone ? 'border-red-500' : 'border-gray-300'}"
						/>
						{#if $errors.phone}
							<p class="mt-1 text-sm text-red-500">{$errors.phone}</p>
						{/if}
					</div>
				</div>

				<!-- Address -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium text-muted-foreground">Address</h3>

					<div class="space-y-2">
						<Label class="block text-sm font-medium text-muted-foreground" for="street-address">
							Street Address
						</Label>
						<Input
							type="text"
							id="street-address"
							name="address.street-address"
							bind:value={$form.address['street-address']}
							class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
            {$errors.address?.['street-address'] ? 'border-red-500' : 'border-gray-300'}"
						/>
						{#if $errors.address?.['street-address']}
							<p class="mt-1 text-sm text-red-500">{$errors.address['street-address']}</p>
						{/if}
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label class="block text-sm font-medium text-muted-foreground" for="locality"
								>City</Label
							>
							<Input
								type="text"
								id="locality"
								name="address.locality"
								bind:value={$form.address.locality}
								class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
              {$errors.address?.locality ? 'border-red-500' : 'border-gray-300'}"
							/>
							{#if $errors.address?.locality}
								<p class="mt-1 text-sm text-red-500">{$errors.address.locality}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label class="block text-sm font-medium text-muted-foreground" for="postal-code">
								Postal Code
							</Label>
							<Input
								type="text"
								id="postal-code"
								name="address.postal-code"
								bind:value={$form.address['postal-code']}
								class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
              {$errors.address?.['postal-code'] ? 'border-red-500' : 'border-gray-300'}"
							/>
							{#if $errors.address?.['postal-code']}
								<p class="mt-1 text-sm text-red-500">{$errors.address['postal-code']}</p>
							{/if}
						</div>
					</div>

					<div class="space-y-2">
						<Label class="block text-sm font-medium text-muted-foreground" for="country"
							>Country</Label
						>
						<Input
							type="text"
							id="country"
							name="address.country-name"
							bind:value={$form.address['country-name']}
							class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
            {$errors.address?.['country-name'] ? 'border-red-500' : 'border-gray-300'}"
						/>
						{#if $errors.address?.['country-name']}
							<p class="mt-1 text-sm text-red-500">{$errors.address['country-name']}</p>
						{/if}
					</div>
				</div>

				<!-- Tax Registration -->
				<div class="space-y-2">
					<Label class="block text-sm font-medium text-muted-foreground" for="taxRegistration">
						Tax Registration Number
					</Label>
					<Input
						type="text"
						id="taxRegistration"
						name="taxRegistration"
						bind:value={$form.taxRegistration}
						class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted
          {$errors.taxRegistration ? 'border-red-500' : 'border-gray-300'}"
					/>
					{#if $errors.taxRegistration}
						<p class="mt-1 text-sm text-red-500">{$errors.taxRegistration}</p>
					{/if}
				</div>
			</div>

			<div class="flex justify-end space-x-4">
				<Button type="submit" disabled={$delayed}>
					{$delayed ? 'Submitting...' : 'Submit'}
				</Button>
			</div>
		</form>
	</CardContent>
</Card>
