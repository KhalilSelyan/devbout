import type { MetaTagsProps } from 'svelte-meta-tags';

export function createBaseMetaTags(url: URL): MetaTagsProps {
	const title = 'DevBout';
	const description =
		"DevBout is an innovative decentralized hackathon platform that leverages Request Network's payment infrastructure and custom smart contracts to create a seamless, transparent hackathon experience. Built with SvelteKit and blockchain technology, it provides end-to-end management of hackathon events, from creation to prize distribution.";
	const canonicalUrl = new URL(url.pathname, url.origin).href;

	return {
		title: title,
		titleTemplate: '%s | DevBout',
		description: description,
		canonical: canonicalUrl,

		keywords: [
			'DevBout',
			'sveltekit',
			'svelte',
			'tailwindcss',
			'svelte-sonner',
			'svelte-meta-tags'
		],

		openGraph: {
			type: 'website',
			url: canonicalUrl,
			locale: 'en_IE',
			title: title,
			description: description,
			siteName: 'DevBout',
			images: [
				{
					url: 'https://www.example.ie/og-image.jpg',
					alt: 'Og Image Alt',
					width: 800,
					height: 600,
					secureUrl: 'https://www.example.ie/og-image.jpg',
					type: 'image/jpeg'
				}
			]
		},

		twitter: {
			site: canonicalUrl,
			cardType: 'summary_large_image',
			title: title,
			description: description,
			image: 'https://www.example.ie/twitter-image.jpg',
			imageAlt: 'Twitter image alt'
		},

		additionalLinkTags: [
			{
				rel: 'apple-touch-icon',
				href: '/favicons/apple-touch-icon.png'
			},
			{
				rel: 'icon',
				type: 'image/svg+xml',
				href: '/favicons/favicon.svg'
			},
			{
				rel: 'mask-icon',
				href: '/favicons/favicon.svg'
			},
			{
				rel: 'alternate icon',
				type: 'image/png',
				href: '/favicons/favicon-96x96.png'
			},
			{
				rel: 'manifest',
				href: `/site.webmanifest`,
				crossOrigin: 'use-credentials'
			}
		]
	};
}

export function createPageMetaTags(metaTags: MetaTagsProps): MetaTagsProps {
	const title = metaTags.title ?? '';
	const description = metaTags.description ?? '';

	return {
		...metaTags,
		openGraph: {
			title: metaTags.openGraph?.title ?? title,
			description: metaTags.openGraph?.description ?? description
		},
		twitter: {
			title: metaTags.twitter?.title ?? title,
			description: metaTags.twitter?.description ?? description
		}
	};
}
