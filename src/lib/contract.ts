import { ethers } from 'ethers';
import { getChainFromNetwork, getNetworkParams } from './rn-utils/req';

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

export enum HackathonState {
	OPEN = 0,
	ONGOING = 1,
	JUDGING = 2,
	COMPLETED = 3
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
export async function announceWinners({
	_hackathonId,
	_winningParticipant,
	contract
}: {
	_hackathonId: string;
	_winningParticipant: string; // Address of the winner
	contract: ethers.Contract;
}) {
	const tx = await contract.announceWinners(_hackathonId, _winningParticipant);

	console.log('Transaction sent:', tx.hash);

	// Wait for the transaction to be mined
	const receipt = await tx.wait();
	console.log('Transaction confirmed:', receipt.transactionHash);
}

// Function for a winner to claim their prize
export async function claimPrize({
	_hackathonId,
	_winnerAddress,
	_wonAmount,
	_paymentRef,
	_ethFeeProxy,
	contract
}: {
	_hackathonId: string;
	_winnerAddress: string;
	_wonAmount: string; // Prize amount in ETH
	_paymentRef: string; // Reference for the payment
	_ethFeeProxy: string; // Address of the EthFeeProxy contract
	contract: ethers.Contract;
}) {
	const tx = await contract.claimPrize(
		_hackathonId,
		_winnerAddress,
		ethers.utils.parseEther(_wonAmount),
		_paymentRef,
		_ethFeeProxy
	);

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
