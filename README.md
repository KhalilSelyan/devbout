# DevBout - Decentralized Hackathon Platform powered by Request Network

## Overview

DevBout is an innovative decentralized hackathon platform that leverages Request Network's payment infrastructure and custom smart contracts to create a seamless, transparent hackathon experience. Built with SvelteKit and blockchain technology, it provides end-to-end management of hackathon events, from creation to prize distribution.

## Complete Platform Flow

### 1. Hackathon Creation

- Organizer initiates hackathon creation through the platform
- Payment processed via Request Network to platform wallet
- Custom smart contract creates hackathon instance
- Initial state set to OPEN

### 2. Team Formation

- Users can create or join teams
- Each team action triggers smart contract updates
- Participants are registered on-chain for the specific hackathon
- Team size validation against hackathon rules

### 3. Submission Phase

- Teams submit their projects
- Submissions stored in database with blockchain verification
- Hackathon state updates to ONGOING

### 4. Judging Phase

- Organizer updates hackathon state to JUDGING
- Judges evaluate submissions based on criteria
- Winners are selected and recorded on-chain
- State transitions to COMPLETED

### 5. Prize Distribution

- Winners can claim prizes through the platform
- Request Network's ETH Fee Proxy handles payments
- Smart contract validates claims and processes distributions
- Hackathon state updates to PAID upon completion

## Core Features

### Platform Capabilities

- Global participant reach
- AI-powered team matching
- Crowdfunded, fully funded, and hybrid prize models
- Smart contract-based prize distribution
- Built-in cryptocurrency wallet support
- Customizable judging criteria

### Technical Features

- Request Network payment processing
- Custom smart contract integration
- Automated prize distribution
- Real-time team collaboration
- Comprehensive dashboard for organizers
- Achievement badge system

## Technology Stack

### Core Technologies

- **Frontend**: SvelteKit
- **Backend**: Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Ethereum (ethers.js)
- **Payments**: Request Network
- **UI**: TailwindCSS, Bits UI

### Key Integrations

- Request Network ETH Fee Proxy
- Custom prize management contract
- Better Auth authentication
- tRPC API layer
- Superforms form handling

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- PNPM package manager
- PostgreSQL database
- Ethereum wallet

### Environment Setup

```env
BETTER_AUTH_SECRET=your_auth_secret
PUBLIC_CONTRACT_ADDRESS=your_contract_address
PUBLIC_JSONRPC_URL=your_jsonrpc_url
PUBLIC_PLATFORM_WALLET_ADDRESS=your_platform_wallet
PLATFORM_WALLET_PRIVATEKEY=your_private_key
```

### Quick Start

```bash
git clone https://github.com/khalilselyan/devbout.git
cd devbout
pnpm install
pnpm db:push
pnpm dev
```

## Security Considerations

- Smart contract validation for state transitions
- Request Network payment verification
- Role-based access control
- Transaction confirmation checks
- Prize distribution verification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

---

Built for the Request Network Hackathon by [KhalilSelyan](https://github.com/khalilselyan)

For detailed documentation, visit our [Wiki](https://github.com/khalilselyan/devbout/wiki).
