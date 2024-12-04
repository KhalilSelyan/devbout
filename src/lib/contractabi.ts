export const contractabi = [
	{ type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
	{
		type: 'function',
		name: 'announceWinners',
		inputs: [
			{ name: '_hackathonId', type: 'string', internalType: 'string' },
			{
				name: '_winningParticipant',
				type: 'address',
				internalType: 'address'
			}
		],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'function',
		name: 'claimPrize',
		inputs: [
			{ name: '_hackathonId', type: 'string', internalType: 'string' },
			{
				name: 'winnerAddress',
				type: 'address',
				internalType: 'address'
			},
			{ name: 'wonAmount', type: 'uint256', internalType: 'uint256' },
			{ name: 'paymentRef', type: 'bytes', internalType: 'bytes' },
			{ name: 'ethFeeProxy', type: 'address', internalType: 'address' }
		],
		outputs: [],
		stateMutability: 'payable'
	},
	{
		type: 'function',
		name: 'createHackathon',
		inputs: [
			{ name: '_isCrowdfunded', type: 'bool', internalType: 'bool' },
			{ name: 'hackathonId', type: 'string', internalType: 'string' }
		],
		outputs: [],
		stateMutability: 'payable'
	},
	{
		type: 'function',
		name: 'getParticipantInfo',
		inputs: [
			{ name: '_hackathonId', type: 'string', internalType: 'string' },
			{
				name: 'participantAddress',
				type: 'address',
				internalType: 'address'
			}
		],
		outputs: [
			{ name: 'isWinner', type: 'bool', internalType: 'bool' },
			{ name: 'hasClaimedPrize', type: 'bool', internalType: 'bool' },
			{
				name: 'walletAddress',
				type: 'address',
				internalType: 'address'
			}
		],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'hackathons',
		inputs: [{ name: '', type: 'string', internalType: 'string' }],
		outputs: [
			{ name: 'id', type: 'string', internalType: 'string' },
			{ name: 'creator', type: 'address', internalType: 'address' },
			{ name: 'basePrize', type: 'uint256', internalType: 'uint256' },
			{
				name: 'contributions',
				type: 'uint256',
				internalType: 'uint256'
			},
			{ name: 'isCrowdfunded', type: 'bool', internalType: 'bool' },
			{
				name: 'state',
				type: 'uint8',
				internalType: 'enum HackathonPrizePool.HackathonState'
			},
			{ name: 'winnerCount', type: 'uint64', internalType: 'uint64' }
		],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'joinHackathon',
		inputs: [{ name: '_hackathonId', type: 'string', internalType: 'string' }],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'function',
		name: 'owner',
		inputs: [],
		outputs: [{ name: '', type: 'address', internalType: 'address' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'recordContribution',
		inputs: [
			{ name: '_hackathonId', type: 'string', internalType: 'string' },
			{ name: '_contributor', type: 'address', internalType: 'address' }
		],
		outputs: [],
		stateMutability: 'payable'
	},
	{
		type: 'function',
		name: 'renounceOwnership',
		inputs: [],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'function',
		name: 'transferOwnership',
		inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'function',
		name: 'updateHackathonState',
		inputs: [
			{ name: '_hackathonId', type: 'string', internalType: 'string' },
			{
				name: '_newState',
				type: 'uint8',
				internalType: 'enum HackathonPrizePool.HackathonState'
			}
		],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'event',
		name: 'ContributionAdded',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'contributor',
				type: 'address',
				indexed: false,
				internalType: 'address'
			},
			{
				name: 'amount',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'HackathonCreated',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'creator',
				type: 'address',
				indexed: false,
				internalType: 'address'
			},
			{
				name: 'basePrize',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256'
			},
			{
				name: 'isCrowdfunded',
				type: 'bool',
				indexed: false,
				internalType: 'bool'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'HackathonStateChanged',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'newState',
				type: 'uint8',
				indexed: false,
				internalType: 'enum HackathonPrizePool.HackathonState'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'OwnershipTransferred',
		inputs: [
			{
				name: 'previousOwner',
				type: 'address',
				indexed: true,
				internalType: 'address'
			},
			{
				name: 'newOwner',
				type: 'address',
				indexed: true,
				internalType: 'address'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'ParticipantJoined',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'participant',
				type: 'address',
				indexed: false,
				internalType: 'address'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'PrizeClaimed',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'participant',
				type: 'address',
				indexed: false,
				internalType: 'address'
			},
			{
				name: 'prize',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256'
			}
		],
		anonymous: false
	},
	{
		type: 'error',
		name: 'OwnableInvalidOwner',
		inputs: [{ name: 'owner', type: 'address', internalType: 'address' }]
	},
	{
		type: 'error',
		name: 'OwnableUnauthorizedAccount',
		inputs: [{ name: 'account', type: 'address', internalType: 'address' }]
	},
	{ type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] }
];
