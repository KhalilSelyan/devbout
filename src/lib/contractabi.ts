export const contractabi = [
	{ type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
	{ type: 'receive', stateMutability: 'payable' },
	{
		type: 'function',
		name: 'announceWinner',
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
		name: 'batchConversionPayments',
		inputs: [],
		outputs: [{ name: '', type: 'address', internalType: 'address' }],
		stateMutability: 'view'
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
			{ name: 'paymentRef', type: 'bytes', internalType: 'bytes' }
		],
		outputs: [],
		stateMutability: 'payable'
	},
	{
		type: 'function',
		name: 'createHackathon',
		inputs: [
			{ name: '_isCrowdfunded', type: 'bool', internalType: 'bool' },
			{ name: 'hackathonId', type: 'string', internalType: 'string' },
			{ name: 'basePrize', type: 'uint256', internalType: 'uint256' }
		],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'function',
		name: 'ethFeeProxy',
		inputs: [],
		outputs: [{ name: '', type: 'address', internalType: 'address' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'executeBatchPayments',
		inputs: [
			{ name: 'hackathonId', type: 'string', internalType: 'string' },
			{
				name: 'metaDetails',
				type: 'tuple[]',
				internalType: 'struct MetaDetail[]',
				components: [
					{
						name: 'paymentNetworkId',
						type: 'uint256',
						internalType: 'uint256'
					},
					{
						name: 'requestDetails',
						type: 'tuple[]',
						internalType: 'struct RequestDetail[]',
						components: [
							{
								name: 'recipient',
								type: 'address',
								internalType: 'address'
							},
							{
								name: 'requestAmount',
								type: 'uint256',
								internalType: 'uint256'
							},
							{
								name: 'path',
								type: 'address[]',
								internalType: 'address[]'
							},
							{
								name: 'paymentReference',
								type: 'bytes',
								internalType: 'bytes'
							},
							{
								name: 'feeAmount',
								type: 'uint256',
								internalType: 'uint256'
							},
							{
								name: 'maxToSpend',
								type: 'uint256',
								internalType: 'uint256'
							},
							{
								name: 'maxRateTimespan',
								type: 'uint256',
								internalType: 'uint256'
							}
						]
					}
				]
			},
			{
				name: 'pathsToUSD',
				type: 'address[][]',
				internalType: 'address[][]'
			},
			{ name: 'feeAddress', type: 'address', internalType: 'address' }
		],
		outputs: [],
		stateMutability: 'nonpayable'
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
				internalType: 'enum HackathonPrizeManagement.HackathonState'
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
			{
				name: '_contributor',
				type: 'address',
				internalType: 'address'
			},
			{
				name: 'contributedAmount',
				type: 'uint256',
				internalType: 'uint256'
			}
		],
		outputs: [],
		stateMutability: 'nonpayable'
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
				internalType: 'enum HackathonPrizeManagement.HackathonState'
			}
		],
		outputs: [],
		stateMutability: 'nonpayable'
	},
	{
		type: 'event',
		name: 'BatchPaymentExecuted',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'BatchPaymentExecutionAttempt',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'winners',
				type: 'address[]',
				indexed: false,
				internalType: 'address[]'
			},
			{
				name: 'amounts',
				type: 'uint256[]',
				indexed: false,
				internalType: 'uint256[]'
			},
			{
				name: 'paymentReferences',
				type: 'bytes[]',
				indexed: false,
				internalType: 'bytes[]'
			},
			{
				name: 'feeAddress',
				type: 'address',
				indexed: false,
				internalType: 'address'
			}
		],
		anonymous: false
	},
	{
		type: 'event',
		name: 'BatchPaymentExecutionFailed',
		inputs: [
			{
				name: 'hackathonId',
				type: 'string',
				indexed: true,
				internalType: 'string'
			},
			{
				name: 'errorMessage',
				type: 'string',
				indexed: false,
				internalType: 'string'
			}
		],
		anonymous: false
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
				internalType: 'enum HackathonPrizeManagement.HackathonState'
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
	}
];
