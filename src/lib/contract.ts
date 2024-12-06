import type { MetaDetail } from '@requestnetwork/types/dist/payment-types';
import { ethers } from 'ethers';
import { getChainFromNetwork, getNetworkParams } from './rn-utils/req';

export enum HackathonState {
	OPEN = 0,
	ONGOING = 1,
	JUDGING = 2,
	COMPLETED = 3
}

export async function createHackathon({
	_hackathonId,
	_isCrowdfunded,
	basePrize,
	contract
}: {
	_hackathonId: string;
	_isCrowdfunded: boolean;
	basePrize: string;
	contract: ethers.Contract;
}) {
	const tx = await contract.createHackathon(_isCrowdfunded, _hackathonId, {
		value: ethers.utils.parseEther(basePrize)
	});

	console.log('Transaction sent:', tx.hash);

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Transaction confirmed:', receipt.transactionHash);
}

// Function for participants to join a hackathon
export async function joinHackathon({
	_hackathonId,
	contract
}: {
	_hackathonId: string;
	contract: ethers.Contract;
}) {
	const tx = await contract.joinHackathon(_hackathonId);

	console.log('Transaction sent:', tx.hash);

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Transaction confirmed:', receipt.transactionHash);
}

// Function to record contributions to a crowdfunded hackathon
export async function recordContribution({
	_hackathonId,
	_amount,
	_contributor,
	contract
}: {
	_hackathonId: string;
	_amount: string; // Amount to contribute in ETH
	_contributor: string; // Contributor's address
	contract: ethers.Contract;
}) {
	try {
		// Add gas estimation explicitly
		const gasEstimate = await contract.estimateGas.recordContribution(_hackathonId, _contributor, {
			value: ethers.utils.parseEther(_amount)
		});

		// Add 20% buffer to gas estimate
		const gasLimit = gasEstimate.mul(120).div(100);

		const tx = await contract.recordContribution(
			_hackathonId, // First parameter: hackathon ID
			_contributor, // Second parameter: contributor address
			{
				value: ethers.utils.parseEther(_amount), // ETH value to send
				gasLimit
			}
		);

		console.log('Transaction sent:', {
			hackathonId: _hackathonId,
			contributor: _contributor,
			amount: _amount,
			tx
		});

		// Wait for the transaction to be mined
		const receipt = await tx.wait();
		console.log('Transaction confirmed:', { receipt });

		return receipt.transactionHash as string;
	} catch (error) {
		// Log more details about the error
		console.error('Contract call failed:', {
			hackathonId: _hackathonId,
			contributor: _contributor,
			amount: _amount,
			error
		});
		throw error;
	}
}

// Function to update the hackathon state
export async function updateHackathonState({
	_hackathonId,
	_newState,
	contract
}: {
	_hackathonId: string;
	_newState: HackathonState;
	contract: ethers.Contract;
}) {
	const tx = await contract.updateHackathonState(_hackathonId, _newState);

	console.log('Transaction sent:', tx.hash);

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Transaction confirmed:', receipt.transactionHash);
}

// Function to announce a winner
export async function announceWinner({
	_hackathonId,
	_winningParticipant,
	contract
}: {
	_hackathonId: string;
	_winningParticipant: string; // Address of the winner
	contract: ethers.Contract;
}) {
	const tx = await contract.announceWinner(_hackathonId, _winningParticipant);

	console.log('Transaction sent:', { tx });

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Transaction confirmed:', receipt.transactionHash);

	return tx;
}

// Function to execute batch payments for winners
export async function executeBatchPayments({
	_hackathonId,
	requestDetails,
	feeAddress,
	contract
}: {
	_hackathonId: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	requestDetails: any[];
	feeAddress: string;
	skipFeeUSDLimit: boolean;
	contract: ethers.Contract;
}) {
	console.log({ _hackathonId, requestDetails, contract });

	// executeBatchPayments(string,(uint256,(address,uint256,address[],bytes,uint256,uint256,uint256)[])[],address[][],address)

	const metaDetails: MetaDetail[] = [{ paymentNetworkId: 3, requestDetails }];

	const pathsToUSD: string[][] = [];
	const tx = await contract.executeBatchPayments(_hackathonId, metaDetails, pathsToUSD, feeAddress);

	console.log({ tx });

	console.log('Batch payment transaction sent:', tx.hash);

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Batch payment confirmed:', receipt.transactionHash);

	return receipt.transactionHash;
}

// Function for a winner to claim their prize
export async function claimPrize({
	_hackathonId,
	_winnerAddress,
	_wonAmount,
	_paymentRef,
	contract
}: {
	_hackathonId: string;
	_winnerAddress: string;
	_wonAmount: ethers.BigNumber; // Prize amount in ETH
	_paymentRef: string; // Reference for the payment
	contract: ethers.Contract;
}) {
	const tx = await contract.claimPrize(_hackathonId, _winnerAddress, _wonAmount, _paymentRef);

	console.log('Transaction sent:', tx.hash);

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Transaction confirmed:', receipt.transactionHash);
}

// Helper to switch to the target network
export async function switchToTargetNetwork(
	ethersProvider: ethers.providers.Web3Provider,
	targetNetworkKey: string
) {
	const targetChain = getChainFromNetwork(targetNetworkKey);

	if (!targetChain) {
		throw new Error(`Unsupported network: ${targetNetworkKey}`);
	}

	const currentChainId = await ethersProvider.getNetwork().then((net) => net.chainId);

	// Switch to the target network if needed
	if (currentChainId !== targetChain.chainId) {
		try {
			await ethersProvider.send('wallet_switchEthereumChain', [
				{ chainId: ethers.utils.hexValue(targetChain.chainId) }
			]);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (switchError: any) {
			// Handle "network not added" case
			if (switchError.code === 4902) {
				try {
					await ethersProvider.send('wallet_addEthereumChain', [getNetworkParams(targetChain)]);
				} catch (addError) {
					console.error(addError);
					throw new Error(`Failed to add network: ${targetChain.name}`);
				}
			} else {
				throw new Error(`Failed to switch to network: ${targetChain.name}`);
			}
		}
	}
}
