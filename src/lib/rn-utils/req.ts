/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	approveErc20,
	hasErc20Approval,
	hasSufficientFunds,
	payRequest
} from '@requestnetwork/payment-processor';
import { RequestNetwork, Types, Utils } from '@requestnetwork/request-client.js';
import { Web3SignatureProvider } from '@requestnetwork/web3-signature';
import { providers, utils } from 'ethers';
import type { BuyerInfo, Currency, PlatformInfo } from './types';
import { chains } from './chains';

export const prepareRequestParameters = ({
	currency,
	platformAddress,
	payerAddress,
	amountInCrypto,
	createdWith,
	builderId,
	platformInfo,
	contributorInfo,
	feeAddress,
	feeAmountInCrypto,
	totalAmountInCrypto,
	payeeIdentity = platformAddress
}: {
	currency: Currency;
	platformAddress: string;
	payerAddress: string;
	amountInCrypto: number;
	builderId: string;
	createdWith: string;
	platformInfo: PlatformInfo;
	contributorInfo: BuyerInfo;
	feeAddress: string;
	feeAmountInCrypto: number;
	totalAmountInCrypto: number;
	payeeIdentity?: string | undefined;
}) => {
	const isERC20 = currency.type === Types.RequestLogic.CURRENCY.ERC20;
	const currencyValue = isERC20 ? currency.address : 'eth';
	const amount = utils
		.parseUnits(totalAmountInCrypto.toFixed(currency.decimals), currency.decimals)
		.toString();

	const note = `Contribution made with ${currency.symbol} on ${currency.network}.`;

	const invoiceItems = [
		{
			name: 'Hackathon Contribution',
			quantity: 1,
			unitPrice: utils
				.parseUnits(amountInCrypto.toFixed(currency.decimals), currency.decimals)
				.toString(),
			discount: '0',
			tax: {
				type: 'percentage',
				amount: '0'
			},
			currency: isERC20 ? currency.address : currency.symbol
		}
	];

	if (feeAmountInCrypto > 0) {
		invoiceItems.push({
			name: 'Fee',
			quantity: 1,
			unitPrice: utils
				.parseUnits(feeAmountInCrypto.toFixed(currency.decimals), currency.decimals)
				.toString(),
			discount: '0',
			tax: {
				type: 'percentage',
				amount: '0'
			},
			currency: isERC20 ? currency.address : currency.symbol
		});
	}

	return {
		requestInfo: {
			currency: {
				type: currency.type,
				value: currencyValue,
				network: currency.network
			},
			expectedAmount: amount,
			payee: {
				type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
				value: payeeIdentity
			},
			payer: {
				type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
				value: payerAddress
			},
			timestamp: Utils.getCurrentTimestampInSecond()
		},
		paymentNetwork: {
			id: isERC20
				? Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
				: Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
			parameters: {
				paymentNetworkName: currency.network,
				paymentAddress: platformAddress,
				feeAddress: feeAddress,
				feeAmount: utils
					.parseUnits(feeAmountInCrypto.toFixed(currency.decimals), currency.decimals)
					.toString()
			}
		},
		contentData: {
			creationDate: new Date().toISOString(),
			invoiceNumber: 'receipt',
			note: note,
			platformInfo: {
				email: platformInfo?.email || undefined,
				firstName: platformInfo?.firstName || undefined,
				lastName: platformInfo?.lastName || undefined,
				businessName: platformInfo?.businessName || undefined,
				phone: platformInfo?.phone || undefined,
				address: platformInfo?.address
					? {
							streetAddress: platformInfo.address['street-address'] || undefined,
							locality: platformInfo.address.locality || undefined,
							postalCode: platformInfo.address['postal-code'] || undefined,
							country: platformInfo.address['country-name'] || undefined
						}
					: undefined,
				taxRegistration: platformInfo?.taxRegistration || undefined
			},
			contributorInfo: {
				email: contributorInfo?.email || undefined,
				firstName: contributorInfo?.firstName || undefined,
				lastName: contributorInfo?.lastName || undefined,
				businessName: contributorInfo?.businessName || undefined,
				phone: contributorInfo?.phone || undefined,
				address: contributorInfo?.address
					? {
							streetAddress: contributorInfo.address['street-address'] || undefined,
							locality: contributorInfo.address.locality || undefined,
							postalCode: contributorInfo.address['postal-code'] || undefined,
							country: contributorInfo.address['country-name'] || undefined
						}
					: undefined,
				taxRegistration: contributorInfo?.taxRegistration || undefined
			},
			invoiceItems,
			paymentTerms: {
				dueDate: new Date().toISOString()
			},
			miscellaneous: {
				createdWith,
				feeAddress,
				feeAmountInCrypto,
				builderId,
				paymentCurrency: {
					type: currency.type,
					value: currencyValue,
					network: currency.network
				}
			}
		},
		signer: {
			type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
			value: payerAddress
		}
	};
};

export const handleRequestPayment = async ({
	requestParameters,
	walletProvider,
	payerAddress,
	persistRequest
}: {
	requestParameters: any;
	walletProvider: any;
	payerAddress: string;
	persistRequest: boolean;
}) => {
	let ethersProvider: providers.Web3Provider;
	let targetChain: (typeof chains)[0];

	const initializeProvider = async () => {
		ethersProvider = new providers.Web3Provider(walletProvider);
		const targetNetwork = requestParameters.requestInfo.currency.network;
		const chain = getChainFromNetwork(targetNetwork);
		if (!chain) {
			throw new Error(`Unsupported network: ${targetNetwork}`);
		}
		targetChain = chain;
	};

	const ensureCorrectNetwork = async () => {
		const currentChainId = await ethersProvider.getNetwork().then((net) => net.chainId);

		if (currentChainId !== targetChain.chainId) {
			try {
				await ethersProvider.send('wallet_switchEthereumChain', [
					{ chainId: utils.hexValue(targetChain.chainId) }
				]);
			} catch (switchError: any) {
				if (switchError.code === 4902) {
					try {
						await ethersProvider.send('wallet_addEthereumChain', [getNetworkParams(targetChain)]);
					} catch (addError) {
						console.error(addError);
						throw new Error(
							`Failed to add and switch to the required network: ${targetChain.name}`
						);
					}
				} else {
					throw new Error(`Failed to switch to the required network: ${targetChain.name}`);
				}
			}
			await initializeProvider();
		}
	};

	const isERC20 = requestParameters.requestInfo.currency.type === Types.RequestLogic.CURRENCY.ERC20;

	await initializeProvider();
	await ensureCorrectNetwork();

	const web3SignatureProvider = new Web3SignatureProvider(ethersProvider!.provider);

	const inMemoryRequestNetwork = new RequestNetwork({
		nodeConnectionConfig: {
			baseURL: 'https://sepolia.gateway.request.network'
		},
		signatureProvider: web3SignatureProvider,
		skipPersistence: true
	});

	const inMemoryRequest = await inMemoryRequestNetwork.createRequest(requestParameters);

	console.log({ inMemoryRequest });

	const signer = await ethersProvider!.getSigner();
	const confirmationBlocks = 1;
	if (isERC20) {
		const requestData = inMemoryRequest.inMemoryInfo?.requestData!;

		const _hasSufficientFunds = await hasSufficientFunds({
			request: inMemoryRequest.inMemoryInfo?.requestData!,
			address: payerAddress,
			providerOptions: {
				provider: ethersProvider!
			}
		});

		if (!_hasSufficientFunds) {
			throw new Error('Insufficient funds');
		}

		const _hasApproval = await hasErc20Approval(requestData, payerAddress, ethersProvider!);

		if (!_hasApproval) {
			const _approve = await approveErc20(inMemoryRequest.inMemoryInfo?.requestData!, signer);
			await _approve.wait(confirmationBlocks);
		}
	}

	console.log({ signer });
	const paymentTx = await payRequest(inMemoryRequest.inMemoryInfo?.requestData!, signer);

	await paymentTx.wait(confirmationBlocks);

	const persistingRequestNetwork = new RequestNetwork({
		nodeConnectionConfig: {
			baseURL: 'https://sepolia.gateway.request.network'
		}
	});

	if (persistRequest) {
		await persistingRequestNetwork.persistRequest(inMemoryRequest);
	}

	if (inMemoryRequest?.inMemoryInfo?.requestData) {
		inMemoryRequest.inMemoryInfo.requestData = {
			...inMemoryRequest.inMemoryInfo.requestData,
			payer: requestParameters.requestInfo.payer,
			payee: requestParameters.requestInfo.payee
		};
	}
	return inMemoryRequest;
};

export const handleRequestCreate = async ({
	requestParameters,
	walletProvider
}: {
	requestParameters: any;
	walletProvider: any;
}) => {
	let ethersProvider: providers.Web3Provider;
	let targetChain: (typeof chains)[0];

	const initializeProvider = async () => {
		ethersProvider = new providers.Web3Provider(walletProvider);
		const targetNetwork = requestParameters.requestInfo.currency.network;
		const chain = getChainFromNetwork(targetNetwork);
		if (!chain) {
			throw new Error(`Unsupported network: ${targetNetwork}`);
		}
		targetChain = chain;
	};

	const ensureCorrectNetwork = async () => {
		const currentChainId = await ethersProvider.getNetwork().then((net) => net.chainId);

		if (currentChainId !== targetChain.chainId) {
			try {
				await ethersProvider.send('wallet_switchEthereumChain', [
					{ chainId: utils.hexValue(targetChain.chainId) }
				]);
			} catch (switchError: any) {
				if (switchError.code === 4902) {
					try {
						await ethersProvider.send('wallet_addEthereumChain', [getNetworkParams(targetChain)]);
					} catch (addError) {
						console.error(addError);
						throw new Error(
							`Failed to add and switch to the required network: ${targetChain.name}`
						);
					}
				} else {
					throw new Error(`Failed to switch to the required network: ${targetChain.name}`);
				}
			}
			await initializeProvider();
		}
	};

	await initializeProvider();
	await ensureCorrectNetwork();

	const web3SignatureProvider = new Web3SignatureProvider(ethersProvider!.provider);

	const inMemoryRequestNetwork = new RequestNetwork({
		nodeConnectionConfig: {
			baseURL: 'https://sepolia.gateway.request.network'
		},
		signatureProvider: web3SignatureProvider,
		skipPersistence: true
	});

	console.log({ inMemoryRequestNetwork });

	console.log({ requestParameters });

	const inMemoryRequest = await inMemoryRequestNetwork.createRequest({
		requestInfo: requestParameters.requestInfo,
		paymentNetwork: requestParameters.paymentNetwork,
		contentData: requestParameters.contentData,
		signer: requestParameters.signer
	});
	console.log({ inMemoryRequest });

	return inMemoryRequest;
};

export function getChainFromNetwork(network: string): (typeof chains)[0] | undefined {
	const networkLower = network.toLowerCase();
	switch (networkLower) {
		case 'mainnet':
		case 'ethereum':
			return chains.find((chain) => chain.name.toLowerCase() === 'ethereum');
		case 'bsc':
		case 'binance smart chain':
			return chains.find((chain) => chain.name.toLowerCase() === 'binance smart chain');
		case 'zksyncera':
		case 'zksync era':
			return chains.find((chain) => chain.name.toLowerCase() === 'zksync era');
		default:
			return chains.find(
				(chain) =>
					chain.name.toLowerCase() === networkLower || chain.currency.toLowerCase() === networkLower
			);
	}
}

export function getNetworkParams(chain: (typeof chains)[0]): any {
	return {
		chainId: utils.hexValue(chain.chainId),
		chainName: chain.name,
		nativeCurrency: {
			name: chain.currency,
			symbol: chain.currency,
			decimals: 18
		},
		rpcUrls: [chain.rpcUrl],
		blockExplorerUrls: [chain.explorerUrl]
	};
}
