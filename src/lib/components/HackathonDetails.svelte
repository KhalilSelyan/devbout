<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Calendar, Clock, DollarSign, Github, LinkIcon, Trophy, Users } from 'lucide-svelte';

	type Hackathon = {
		id: string;
		name: string;
		description: string;
		startDate: Date;
		endDate: Date;
		minTeamSize: number;
		maxTeamSize: number;
		prizePool: string;
		basePrize: string;
		fundingType: 'FULLY_FUNDED' | 'CROWDFUNDED' | 'HYBRID';
		status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED';
		judgingCriteria: Record<string, number>;
		aiGeneratedTopics: string[];
	};

	type Contributor = {
		id: string;
		name: string;
		avatar: string;
		contribution: string;
		badges: string[];
	};

	type Team = {
		id: string;
		name: string;
		members: string[];
		xpPoints: number;
	};

	type Submission = {
		id: string;
		teamId: string;
		projectName: string;
		description: string;
		submissionUrl?: string;
		githubUrl?: string;
		score?: string;
		submittedAt: Date;
	};

	let mockHackathon: Hackathon = {
		id: '1',
		name: 'AI for Good Hackathon',
		description:
			'Develop AI solutions to address global challenges and make a positive impact on society.',
		startDate: new Date('2024-06-01'),
		endDate: new Date('2024-06-03'),
		minTeamSize: 2,
		maxTeamSize: 5,
		prizePool: '10000',
		basePrize: '5000',
		fundingType: 'HYBRID',
		status: 'ONGOING',
		judgingCriteria: {
			Innovation: 30,
			Impact: 30,
			Feasibility: 20,
			Presentation: 20
		},
		aiGeneratedTopics: [
			'AI-powered disaster response system',
			'Sustainable agriculture optimization using machine learning',
			'Accessible education platform with AI tutoring'
		]
	};

	let mockContributors: Contributor[] = [
		{
			id: '1',
			name: 'Alice Johnson',
			avatar: '/favicon.png',
			contribution: '2000',
			badges: ['Early Backer', 'Top Contributor']
		},
		{
			id: '2',
			name: 'Bob Smith',
			avatar: '/favicon.png',
			contribution: '1500',
			badges: ['Innovator']
		},
		{
			id: '3',
			name: 'Charlie Brown',
			avatar: '/favicon.png',
			contribution: '1000',
			badges: ['Regular Supporter']
		}
	];

	let mockTeams: Team[] = [
		{ id: '1', name: 'Tech Wizards', members: ['Alice', 'Bob'], xpPoints: 500 },
		{ id: '2', name: 'AI Innovators', members: ['Charlie', 'David', 'Eve'], xpPoints: 450 }
	];

	let mockSubmissions: Submission[] = [
		{
			id: '1',
			teamId: '1',
			projectName: 'EcoAI',
			description: 'An AI-powered solution for optimizing waste management in cities.',
			submissionUrl: 'https://example.com/ecoai',
			githubUrl: 'https://github.com/techwizards/ecoai',
			submittedAt: new Date('2024-06-03T10:00:00')
		},
		{
			id: '2',
			teamId: '2',
			projectName: 'HealthBot',
			description: 'An AI chatbot for providing mental health support and resources.',
			submissionUrl: 'https://example.com/healthbot',
			githubUrl: 'https://github.com/aiinnovators/healthbot',
			submittedAt: new Date('2024-06-03T11:30:00')
		}
	];
	let activeTab = $state('overview');
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<h1 class="text-3xl font-bold text-gray-900">{mockHackathon.name}</h1>
			<div class="mt-2 flex items-center space-x-2">
				<Badge variant={mockHackathon.status === 'ONGOING' ? 'default' : 'secondary'}>
					{mockHackathon.status}
				</Badge>
				<Badge variant="outline">{mockHackathon.fundingType}</Badge>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<Tabs
			value={activeTab}
			onValueChange={(tab) => {
				activeTab = tab;
			}}
		>
			<TabsList class="grid w-full grid-cols-4">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="contributors">Contributors</TabsTrigger>
				<TabsTrigger value="teams">Teams</TabsTrigger>
				<TabsTrigger value="submissions">Submissions</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<Card>
					<CardHeader>
						<CardTitle>Hackathon Details</CardTitle>
						<CardDescription>{mockHackathon.description}</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<Calendar class="h-5 w-5 text-gray-500" />
								<span>
									{mockHackathon.startDate.toLocaleDateString()} - {mockHackathon.endDate.toLocaleDateString()}
								</span>
							</div>
							<div class="flex items-center space-x-2">
								<Users class="h-5 w-5 text-gray-500" />
								<span>Team Size: {mockHackathon.minTeamSize} - {mockHackathon.maxTeamSize}</span>
							</div>
						</div>
						<div>
							<h3 class="mb-2 text-lg font-semibold">Prize Pool</h3>
							<div class="flex items-center space-x-2">
								<DollarSign class="h-5 w-5 text-green-500" />
								<span class="text-2xl font-bold"
									>${parseInt(mockHackathon.prizePool).toLocaleString()}</span
								>
							</div>
							<p class="mt-1 text-sm text-gray-500">
								Base Prize: ${parseInt(mockHackathon.basePrize).toLocaleString()}
							</p>
						</div>
						<div>
							<h3 class="mb-2 text-lg font-semibold">Judging Criteria</h3>
							<ul class="space-y-2">
								{#each Object.entries(mockHackathon.judgingCriteria) as [criterion, weight]}
									<li class="flex items-center justify-between">
										<span>{criterion}</span>
										<span class="font-semibold">{weight}%</span>
									</li>
								{/each}
							</ul>
						</div>
						<div>
							<h3 class="mb-2 text-lg font-semibold">AI-Generated Topics</h3>
							<ul class="list-inside list-disc space-y-1">
								{#each mockHackathon.aiGeneratedTopics as topic}
									<li>{topic}</li>
								{/each}
							</ul>
						</div>
					</CardContent>
					<CardFooter>
						<Button class="w-full">Join Hackathon</Button>
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="contributors">
				<Card>
					<CardHeader>
						<CardTitle>Top Contributors</CardTitle>
						<CardDescription
							>Recognizing those who have contributed to the prize pool</CardDescription
						>
					</CardHeader>
					<CardContent>
						<ul class="space-y-4">
							{#each mockContributors as contributor}
								<li class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<Avatar>
											<AvatarImage src={contributor.avatar} alt={contributor.name} />
											<AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
										</Avatar>
										<div>
											<p class="font-semibold">{contributor.name}</p>
											<div class="flex space-x-1">
												{#each contributor.badges as badge, index}
													<Badge variant="secondary">
														{badge}
													</Badge>
												{/each}
											</div>
										</div>
									</div>
									<span class="font-bold">
										${parseInt(contributor.contribution).toLocaleString()}
									</span>
								</li>
							{/each}
						</ul>
					</CardContent>
					<CardFooter>
						<Button variant="outline" class="w-full">Contribute to Prize Pool</Button>
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="teams">
				<Card>
					<CardHeader>
						<CardTitle>Participating Teams</CardTitle>
						<CardDescription>Teams competing in this hackathon</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="space-y-4">
							{#each mockTeams as team}
								<li class="rounded-lg border p-4">
									<div class="mb-2 flex items-center justify-between">
										<h3 class="text-lg font-semibold">{team.name}</h3>
										<Badge variant="secondary">{team.members.length} members</Badge>
									</div>
									<p class="mb-2 text-sm text-gray-500">Members: {team.members.join(', ')}</p>
									<div class="flex items-center space-x-2">
										<Trophy class="h-4 w-4 text-yellow-500" />
										<span class="text-sm font-medium">XP: {team.xpPoints}</span>
									</div>
								</li>
							{/each}
						</ul>
					</CardContent>
					<CardFooter>
						<Button class="w-full">Create or Join a Team</Button>
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="submissions">
				<Card>
					<CardHeader>
						<CardTitle>Project Submissions</CardTitle>
						<CardDescription>Submitted projects for this hackathon</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="space-y-6">
							{#each mockSubmissions as submission}
								<li class="rounded-lg border p-4">
									<div class="mb-2 flex items-start justify-between">
										<h3 class="text-lg font-semibold">{submission.projectName}</h3>
										<Badge variant="outline">Team {submission.teamId}</Badge>
									</div>
									<p class="mb-4 text-sm text-gray-600">{submission.description}</p>
									<div class="flex items-center space-x-4 text-sm">
										<div class="flex items-center space-x-1">
											<Clock class="h-4 w-4" />
											<span>{submission.submittedAt.toLocaleString()}</span>
										</div>
										{#if submission.submissionUrl}
											<a
												href={submission.submissionUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="flex items-center space-x-1 text-blue-600 hover:underline"
											>
												<LinkIcon class="h-4 w-4" />
												<span>View Project</span>
											</a>
										{/if}
										{#if submission.githubUrl}
											<a
												href={submission.githubUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="flex items-center space-x-1 text-blue-600 hover:underline"
											>
												<Github class="h-4 w-4" />
												<span>GitHub</span>
											</a>
										{/if}
									</div>
								</li>
							{/each}
						</ul>
					</CardContent>
					<CardFooter>
						<Button class="w-full">Submit Your Project</Button>
					</CardFooter>
				</Card>
			</TabsContent>
		</Tabs>
	</main>
</div>
