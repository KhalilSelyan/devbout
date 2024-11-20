<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { DollarSign, Trophy, Star, Calendar } from 'lucide-svelte';

	type UserProfile = {
		id: string;
		name: string;
		email: string;
		avatar: string;
		walletAddress: string;
		bio: string;
		skills: string[];
		xpPoints: number;
		badges: { id: string; name: string; description: string }[];
		contributions: { hackathonId: string; hackathonName: string; amount: string; date: string }[];
		hackathons: {
			organized: { id: string; name: string; date: string; status: string }[];
			participated: { id: string; name: string; date: string; teamName: string; status: string }[];
			current: { id: string; name: string; endDate: string; teamName: string }[];
		};
	};

	const mockUserProfile: UserProfile = {
		id: '1',
		name: 'Alice Johnson',
		email: 'alice@example.com',
		avatar: '/favicon.png',
		walletAddress: '0x1234...5678',
		bio: 'Passionate developer and hackathon enthusiast. Always looking for new challenges and opportunities to innovate.',
		skills: ['React', 'Node.js', 'Solidity', 'Python', 'AI/ML'],
		xpPoints: 1500,
		badges: [
			{ id: '1', name: 'Early Adopter', description: 'One of the first 100 users on the platform' },
			{ id: '2', name: 'Hackathon Veteran', description: 'Participated in 10+ hackathons' },
			{ id: '3', name: 'Top Contributor', description: 'Contributed over $5000 to prize pools' }
		],
		contributions: [
			{ hackathonId: '1', hackathonName: 'AI for Good', amount: '1000', date: '2024-03-15' },
			{
				hackathonId: '2',
				hackathonName: 'Blockchain Revolution',
				amount: '500',
				date: '2024-02-01'
			}
		],
		hackathons: {
			organized: [
				{ id: '1', name: 'Green Tech Challenge', date: '2024-01-10', status: 'Completed' }
			],
			participated: [
				{
					id: '2',
					name: 'AI for Good',
					date: '2024-03-15',
					teamName: 'Tech Wizards',
					status: 'Completed'
				},
				{
					id: '3',
					name: 'Blockchain Revolution',
					date: '2024-02-01',
					teamName: 'Chain Gang',
					status: 'Completed'
				}
			],
			current: [
				{
					id: '4',
					name: 'Quantum Computing Quest',
					endDate: '2024-06-30',
					teamName: 'Quantum Leapers'
				}
			]
		}
	};

	let profile = $state(mockUserProfile);

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		profile = { ...profile, [target.name]: target.value };
	}

	function handleSkillsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		profile = {
			...profile,
			skills: target.value.split(',').map((skill) => skill.trim())
		};
	}

	$effect(() => {
		$inspect({ profile });
	});
</script>

<div class="min-h-screen bg-background">
	<header class="bg-muted">
		<div class="container mx-auto py-6">
			<h1 class="text-3xl font-bold text-foreground">Your Profile</h1>
		</div>
	</header>
	<main class="container mx-auto py-6">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<Card class="md:col-span-2">
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<div class="flex items-center space-x-4">
							<Avatar class="h-20 w-20">
								<AvatarImage src={profile.avatar} alt={profile.name} />
								<AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<Button variant="outline">Change Picture</Button>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="name">Name</Label>
								<Input id="name" name="name" value={profile.name} oninput={handleInputChange} />
							</div>
							<div class="space-y-2">
								<Label for="email">Email</Label>
								<Input id="email" name="email" value={profile.email} oninput={handleInputChange} />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="walletAddress">Wallet Address</Label>
							<Input
								id="walletAddress"
								name="walletAddress"
								value={profile.walletAddress}
								oninput={handleInputChange}
							/>
						</div>
						<div class="space-y-2">
							<Label for="bio">Bio</Label>
							<Textarea id="bio" name="bio" value={profile.bio} oninput={handleInputChange} />
						</div>
						<div class="space-y-2">
							<Label for="skills">Skills (comma-separated)</Label>
							<Input
								id="skills"
								name="skills"
								value={profile.skills.join(', ')}
								oninput={handleSkillsChange}
							/>
						</div>
						<Button>Save Changes</Button>
					</div>
				</CardContent>
			</Card>
			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>XP Points</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="flex items-center space-x-2">
							<Trophy class="h-6 w-6 text-primary" />
							<span class="text-2xl font-bold">{profile.xpPoints}</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Badges</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							{#each profile.badges as badge (badge.id)}
								<div class="flex items-start space-x-2">
									<Star class="mt-0.5 h-5 w-5 text-primary" />
									<div>
										<p class="font-semibold">{badge.name}</p>
										<p class="text-sm text-muted-foreground">{badge.description}</p>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
		<Separator class="my-6" />
		<Tabs value="contributions" class="w-full">
			<TabsList>
				<TabsTrigger value="contributions">Contributions</TabsTrigger>
				<TabsTrigger value="hackathons">Hackathons</TabsTrigger>
			</TabsList>
			<TabsContent value="contributions">
				<Card>
					<CardHeader>
						<CardTitle>Your Contributions</CardTitle>
						<CardDescription>Prize pool contributions you've made</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="space-y-4">
							{#each profile.contributions as contribution (contribution.hackathonId)}
								<li class="flex items-center justify-between">
									<div>
										<p class="font-semibold">{contribution.hackathonName}</p>
										<p class="text-sm text-muted-foreground">{contribution.date}</p>
									</div>
									<Badge variant="secondary" class="flex items-center space-x-1">
										<DollarSign class="h-4 w-4" />
										<span>{contribution.amount}</span>
									</Badge>
								</li>
							{/each}
						</ul>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="hackathons">
				<Card>
					<CardHeader>
						<CardTitle>Your Hackathons</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-6">
							<div>
								<h3 class="mb-2 text-lg font-semibold">Currently Participating</h3>
								<ul class="space-y-2">
									{#each profile.hackathons.current as hackathon (hackathon.id)}
										<li class="flex items-center justify-between">
											<div>
												<p class="font-semibold">{hackathon.name}</p>
												<p class="text-sm text-muted-foreground">Team: {hackathon.teamName}</p>
											</div>
											<Badge variant="outline" class="flex items-center space-x-1">
												<Calendar class="h-4 w-4" />
												<span>Ends {hackathon.endDate}</span>
											</Badge>
										</li>
									{/each}
								</ul>
							</div>
							<div>
								<h3 class="mb-2 text-lg font-semibold">Participated</h3>
								<ul class="space-y-2">
									{#each profile.hackathons.participated as hackathon (hackathon.id)}
										<li class="flex items-center justify-between">
											<div>
												<p class="font-semibold">{hackathon.name}</p>
												<p class="text-sm text-muted-foreground">Team: {hackathon.teamName}</p>
											</div>
											<Badge>{hackathon.status}</Badge>
										</li>
									{/each}
								</ul>
							</div>
							<div>
								<h3 class="mb-2 text-lg font-semibold">Organized</h3>
								<ul class="space-y-2">
									{#each profile.hackathons.organized as hackathon (hackathon.id)}
										<li class="flex items-center justify-between">
											<div>
												<p class="font-semibold">{hackathon.name}</p>
												<p class="text-sm text-muted-foreground">{hackathon.date}</p>
											</div>
											<Badge>{hackathon.status}</Badge>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	</main>
</div>
