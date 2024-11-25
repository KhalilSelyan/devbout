import { createAppKit } from '@reown/appkit';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { sepolia } from '@reown/appkit/networks';

// 1. Get projectId from https://cloud.reown.com
const projectId = '6d62b78ac0053e81f7b7efcf2976a249';

// 2. Create your application's metadata object
const metadata = {
	name: 'DevBout',
	description: 'Hackathon Platform',
	url: 'https://devbout.khalilselyan.com/',
	icons: ['https://assets.reown.com/reown-profile-pic.png']
};

// 3. Create a AppKit instance
export const appKit = createAppKit({
	adapters: [new Ethers5Adapter()],
	networks: [sepolia],
	metadata,
	defaultNetwork: sepolia,
	projectId,
	features: {
		socials: false,
		email: false,
		analytics: false // Optional - defaults to your Cloud configuration
	}
});
