export type Currency = {
	id: string;
	hash: string;
	address?: string;
	network: keyof typeof NETWORK_LABEL;
	decimals: number;
	symbol: string;
	type: 'ERC20' | 'ETH';
	name?: string;
};

export type PaymentStep = 'currency' | 'buyer-info' | 'confirmation' | 'complete';

export const CURRENCY_ID = {
	AXS_MAINNET: 'AXS-mainnet',
	AUDIO_MAINNET: 'AUDIO-mainnet',
	RAI_MAINNET: 'RAI-mainnet',
	SYLO_MAINNET: 'SYLO-mainnet',
	LDO_MAINNET: 'LDO-mainnet',
	UST_MAINNET: 'UST-mainnet',
	MNT_MAINNET: 'MNT-mainnet',
	MIR_MAINNET: 'MIR-mainnet',
	INJ_MAINNET: 'INJ-mainnet',
	OCEAN_MAINNET: 'OCEAN-mainnet',
	ANKR_MAINNET: 'ANKR-mainnet',
	RLY_MAINNET: 'RLY-mainnet',
	DAI_MATIC: 'DAI-matic',
	USDC_MATIC: 'USDC-matic',
	USDT_MATIC: 'USDT-matic',
	DAI_BSC: 'DAI-bsc',
	BUSD_BSC: 'BUSD-bsc',
	USDC_XDAI: 'USDC-xdai',
	USDC_AVALANCHE: 'USDC-avalanche',
	USDT_AVALANCHE: 'USDT-avalanche',
	USDC_OPTIMISM: 'USDC-optimism',
	USDT_OPTIMISM: 'USDT-optimism',
	DAI_OPTIMISM: 'DAI-optimism',
	'USDC-MULTICHAIN_MOONBEAM': 'USDC-multichain-moonbeam',
	'USDC-WORMHOLE_MOONBEAM': 'USDC-wormhole-moonbeam',
	ETH_MAINNET: 'ETH-mainnet',
	USDC_MAINNET: 'USDC-mainnet',
	USDT_MAINNET: 'USDT-mainnet',
	REQ_MAINNET: 'REQ-mainnet',
	MATIC_MATIC: 'MATIC-matic',
	FTM_FANTOM: 'FTM-fantom',
	AVAX_AVALANCHE: 'AVAX-avalanche',
	'ETH-OPTIMISM_OPTIMISM': 'ETH-optimism-optimism',
	MNT_MANTLE: 'MNT-mantle',
	'ETH-SEPOLIA_SEPOLIA': 'ETH-sepolia-sepolia',
	FUSDT_SEPOLIA: 'fUSDT-sepolia',
	FUSDC_SEPOLIA: 'fUSDC-sepolia',
	'ETH-ZKSYNC_ZKSYNCERA': 'ETH-zksync-zksyncera',
	'ETH-BASE_BASE': 'ETH-base-base'
} as const;

export type SupportedCurrencies = [CurrencyID, ...CurrencyID[]];
export type CurrencyID = (typeof CURRENCY_ID)[keyof typeof CURRENCY_ID];

export const NETWORK_LABEL = {
	mainnet: 'Ethereum',
	matic: 'Polygon',
	sepolia: 'Sepolia',
	fantom: 'Fantom',
	bsc: 'Binance Smart Chain',
	xdai: 'Gnosis Chain',
	avalanche: 'Avalanche',
	optimism: 'Optimism',
	moonbeam: 'Moonbeam',
	'arbitrum-one': 'Arbitrum One',
	mantle: 'Mantle',
	zksyncera: 'zkSync Era',
	base: 'Base'
};

export interface Address {
	'street-address'?: string;
	locality?: string;
	region?: string;
	'country-name'?: string;
	'postal-code'?: string;
}

export interface PlatformInfo {
	logo?: string;
	name?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	businessName?: string;
	phone?: string;
	address?: Address;
	taxRegistration?: string;
	companyRegistration?: string;
}

export interface BuyerInfo {
	email?: string;
	firstName?: string;
	lastName?: string;
	businessName?: string;
	phone?: string;
	address?: Address;
	taxRegistration?: string;
	companyRegistration?: string;
}

export type ProductInfo = {
	name?: string;
	description?: string;
	image?: string;
};
