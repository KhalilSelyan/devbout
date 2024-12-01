import { isAddress } from 'viem';

export const checkAddress = (address: string): boolean => {
	return isAddress(address, {
		strict: false
	});
};

export const formatAddress = (address: string, first: number = 6, last: number = 4): string => {
	if (!checkAddress(address)) {
		console.error('Invalid address!');
	}

	return `${address.slice(0, first)}...${address.slice(-last)}`;
};
