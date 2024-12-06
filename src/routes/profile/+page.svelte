<script lang="ts">
	import UserProfile from '$lib/components/UserProfile.svelte';

	let { data } = $props();
</script>

<UserProfile
	user={data.user}
	form={data.form}
	formdata={data.formdata}
	userProfileData={data.userProfileData}
	userContributions={data.userContributions}
	userRequests={data.userRequests}
	userHackathons={data.userHackathons}
/>
