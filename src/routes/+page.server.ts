import type { PageServerLoad } from './$types';

import { createPageMetaTags } from '$lib/metaTags';

export const load: PageServerLoad = async () => {
	const pageMetaTags = createPageMetaTags({
		title: 'Landing',
		description: 'Landing page for DevBout'
	});

	return {
		pageMetaTags: Object.freeze(pageMetaTags)
	};
};
