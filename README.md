# Trustless Work — Escrow-as-a-Service on Solana

**StableHacks 2026 | Track: Programmable Stablecoin Payments**

Trustless Work is a non-custodial escrow protocol built on Solana that enables milestone-based payments with institutional-grade compliance (KYC/KYT/AML/Travel Rule). It allows any application to embed programmable escrow logic via a simple REST API, while all fund custody and release logic lives on-chain.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│   Dashboard      │────▶│   API Server     │────▶│  Solana Program      │
│   (Next.js 15)   │     │   (NestJS)       │     │  (Anchor 0.31.1)     │
│                  │     │                  │     │                      │
│  Wallet Adapter  │     │  JWT Auth        │     │  Single-Release      │
│  Compliance UI   │     │  KYC Guard       │     │  Multi-Release       │
│  Escrow CRUD     │     │  Travel Rule     │     │  Compliance Layer    │
│                  │     │  KYT Monitoring  │     │  PDA-based custody   │
└──────────────────┘     │  Firestore       │     └──────────────────────┘
                         └──────────────────┘
```

### Monorepo Structure

```
apps/
  smart-contract/    Anchor program — escrow + compliance instructions
  server/            NestJS API — transaction building, auth, compliance middleware
  dashboard/         Next.js 15 — user-facing escrow management UI
packages/
  programs/          Generated IDL and TypeScript types
```

## Key Features

### Escrow Types
- **Single-Release**: All milestones must be approved before funds release to a single receiver
- **Multi-Release**: Per-milestone funding with individual amounts and receivers, partial releases

### Compliance Layer (On-Chain)
- **KYC Verification**: Per-address verification stored as PDA (`["kyc", address]`)
- **Escrow Compliance**: Per-escrow compliance requirements (`["escrow_compliance", escrow_address]`)
- **Travel Rule**: FATF-compliant originator/beneficiary data for transactions above threshold
- **Sanctioned Jurisdictions**: On-chain rejection of KP, IR, SY, CU, and others

### Compliance Middleware (API)
- **KYC Guard**: NestJS guard that checks on-chain KYC status before allowing escrow operations
- **Travel Rule Guard**: Validates travel rule data for high-value transactions
- **KYT (Know Your Transaction)**: Transaction monitoring with suspicious activity detection
- **Audit Logs**: Full audit trail stored in Firestore with pagination

### Unsigned Transaction Pattern
The API builds unsigned transactions server-side and returns base64-encoded data. The frontend signs with the user's wallet (Phantom/Solflare) and sends the signed transaction back for submission. This keeps private keys client-side while letting the API handle complex transaction construction.

## Program Instructions

| Category | Instruction | Description |
|----------|-------------|-------------|
| Single-Release | `initialize_escrow` | Create escrow with milestones and roles |
| | `fund_escrow` | Deposit SPL tokens into escrow |
| | `change_milestone_status` | Service provider updates milestone |
| | `change_milestone_flag` | Approver approves milestone |
| | `release_funds` | Distribute to receiver, platform, protocol |
| | `change_dispute_flag` | Start dispute (approver or SP) |
| | `resolve_dispute` | Dispute resolver allocates funds |
| | `change_escrow_properties` | Platform updates escrow config |
| Multi-Release | `initialize_multi_release_escrow` | Create with per-milestone amounts |
| | `fund_multi_release_escrow` | Fund the multi-release escrow |
| | `change_multi_release_milestone_status` | Update milestone status |
| | `approve_multi_release_milestone` | Approve individual milestone |
| | `release_milestone_funds` | Release funds for one milestone |
| | `dispute_milestone` | Dispute a specific milestone |
| | `resolve_milestone_dispute` | Resolve milestone dispute |
| | `withdraw_remaining_funds` | Withdraw after all settled |
| Compliance | `initialize_compliance_registry` | Set up compliance authority |
| | `verify_address` | KYC-verify a wallet address |
| | `revoke_verification` | Remove KYC verification |
| | `set_escrow_compliance` | Enable KYC for an escrow |
| | `set_travel_rule_data` | Set FATF travel rule data |

## Setup

### Prerequisites
- [Bun](https://bun.sh) v1.2+
- [Anchor](https://www.anchor-lang.com/) v0.31.1
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) v2.1+
- Node.js 18+

### Install

```bash
bun install
```

### Environment Variables

**Server** (`apps/server/.env`):
```
PORT=3000
SOLANA_SERVER_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=A2f8EQ1iYEFLkiN1UTDBkMYKR2Hxw7vqBb8srcVjGxk4
SOLANA_PAYER_SECRET_KEY_JSON=[...]
TRUSTLESS_WORK_FEE_WALLET=<protocol fee wallet>
USDC_TOKEN_MINT=<SPL token mint address>
CLIENT_URL=http://localhost:3001
JWT_SECRET=<your-jwt-secret>
FIREBASE_PROJECT_ID=<firebase-project-id>
FIREBASE_CLIENT_EMAIL=<firebase-client-email>
FIREBASE_PRIVATE_KEY=<firebase-private-key>
```

**Dashboard** (`apps/dashboard/.env`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Run

```bash
# Smart contract (local validator)
cd apps/smart-contract && anchor test

# API server
cd apps/server && bun run start:dev

# Dashboard
cd apps/dashboard && bun run dev
```

Or use Taskfile:
```bash
task server    # Start API server
task dashboard # Start dashboard
task test      # Run smart contract tests
```

## Tests

### Smart Contract (50+ test cases)
```bash
cd apps/smart-contract && anchor test
```

| File | Tests | Coverage |
|------|-------|----------|
| `escrow.test.ts` | 14 | Full single-release lifecycle |
| `multi-release.test.ts` | 12 | Full multi-release lifecycle |
| `compliance.test.ts` | 14 | KYC, travel rule, sanctioned jurisdictions |
| `edge-cases.test.ts` | 10 | Error paths, unauthorized access, overflow |

### Server E2E
```bash
cd apps/server && bun run test:e2e
```

Tests verify JWT guard enforcement on all 28+ endpoints across escrow and compliance controllers.

## Compliance Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  KYC Check  │────▶│  On-Chain PDA    │────▶│  Guard Pass/    │
│  (API Guard)│     │  Verification    │     │  Reject         │
└─────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Travel Rule │────▶│  Threshold Check │────▶│  Require Data / │
│  (API Guard)│     │  Registry PDA    │     │  Allow          │
└─────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  KYT Monitor│────▶│  TX Logging      │────▶│  Alert if       │
│  (Service)  │     │  Firestore       │     │  Suspicious     │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

- **KYC**: On-chain address verification via `AddressVerification` PDA. API guard checks status before escrow operations.
- **KYT**: Off-chain transaction monitoring. Logs every compliance action. Detects >20 tx/hour or >1B volume anomalies.
- **AML**: Sanctioned jurisdiction blocklist enforced on-chain (KP, IR, SY, CU). Risk score stored per address.
- **Travel Rule**: FATF-compliant originator/beneficiary data required for transactions exceeding the registry threshold.

## Program ID

```
A2f8EQ1iYEFLkiN1UTDBkMYKR2Hxw7vqBb8srcVjGxk4
```

Deployed on Solana Devnet.

## License

MIT
