<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { route } from '$lib/ROUTES';
	import { ChevronRight, Globe, Trophy, Users, Zap, DollarSign, Target, Code } from 'lucide-svelte';

	// Feature cards data
	const features = [
		{
			icon: Globe,
			title: 'Global Reach',
			description: 'Connect with participants from around the world and tackle global challenges.'
		},
		{
			icon: Users,
			title: 'Team Formation',
			description: 'Find the perfect teammates with our AI-powered matching system.'
		},
		{
			icon: Trophy,
			title: 'Exciting Prizes',
			description: 'Win from our crowdfunded prize pools and gain recognition for your innovations.'
		},
		{
			icon: Code,
			title: 'Diverse Challenges',
			description: 'From AI to blockchain, tackle cutting-edge problems across various domains.'
		}
	];

	// Leaderboard data
	const leaderboards = [
		{
			title: 'Top Contributors',
			icon: DollarSign,
			leaders: [
				{ name: 'Alex Chen', score: '$5,000' },
				{ name: 'Sophia Patel', score: '$4,200' },
				{ name: 'Marcus Johnson', score: '$3,800' }
			]
		},
		{
			title: 'Most Active',
			icon: Zap,
			leaders: [
				{ name: 'Emma Watson', score: '42 sprints' },
				{ name: 'Liam Neeson', score: '38 sprints' },
				{ name: 'Olivia Wilde', score: '35 sprints' }
			]
		},
		{
			title: 'Innovation Score',
			icon: Target,
			leaders: [
				{ name: 'Tony Stark', score: '98/100' },
				{ name: 'Bruce Banner', score: '95/100' },
				{ name: 'Peter Parker', score: '92/100' }
			]
		}
	];
</script>

<main class="relative">
	<div
		class="absolute left-1/2 top-0 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-emerald-500 opacity-20 blur-3xl"
	></div>
	<div class="container relative z-10 mx-auto px-4 py-16 text-center">
		<h2 class="focusin mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
			Sprint Towards Innovation with Global Hackathons
		</h2>

		<p class="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
			Join DevBout, where developers, designers, and innovators collaborate in exciting hackathons
			to build groundbreaking projects and shape the future.
		</p>

		<div class="mt-10 flex justify-center gap-4">
			<Button href={route('/hackathons')} size="lg">
				Explore Hackathons
				<ChevronRight class="ml-2 h-4 w-4" />
			</Button>
		</div>
	</div>

	<div class="container mx-auto px-4 py-16">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			{#each features as feature (feature.title)}
				<div class="rounded-lg bg-white p-6 text-center shadow-md motion-rotate-in-[0.5turn]">
					<div class="mb-4 flex justify-center">
						<feature.icon class="h-10 w-10 text-primary" />
					</div>
					<h3 class="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
					<p class="text-gray-600">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>

	<div class="bg-gray-50 py-16">
		<div class="container mx-auto px-4">
			<h3 class="mb-8 text-center text-3xl font-bold">DevBout Champions</h3>
			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each leaderboards as leaderboard}
					<div class="rounded-lg bg-white p-6 shadow-md">
						<div class="mb-4 flex items-center justify-between">
							<h4 class="text-xl font-semibold">{leaderboard.title}</h4>
							<leaderboard.icon class="h-6 w-6 text-primary" />
						</div>
						<ul class="space-y-2">
							{#each leaderboard.leaders as leader, index}
								<li class="flex items-center justify-between border-b py-2 last:border-b-0">
									<span class="flex items-center">
										<span class="w-6 font-bold text-primary">{index + 1}.</span>
										{leader.name}
									</span>
									<span class="font-semibold">{leader.score}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
			<div class="mt-12 text-center">
				<Button variant="outline" size="lg" class="border-primary text-primary">
					View Full Leaderboard
				</Button>
			</div>
		</div>
	</div>
</main>
