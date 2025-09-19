import type { Currency } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const currencies: Array<Currency> = [
	{
		decimals: 18,
		hash: '',
		id: 'ETH-sepolia',
		network: 'sepolia',
		symbol: 'ETH',
		type: 'ETH',
		address: 'eth',
		name: 'Ethereum (Sepolia)'
	},
	{
		decimals: 18,
		hash: '',
		id: 'FAU-sepolia',
		network: 'sepolia',
		symbol: 'FAU',
		type: 'ERC20',
		address: '0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C',
		name: 'FAU Token (Sepolia)'
	}
];
