# @trustless-work/sdk-solana

TypeScript SDK for [Trustless Work](https://trustlesswork.com) on Solana. Wraps the REST API with a type-safe client and optional React hooks.

## Installation

```bash
bun add @trustless-work/sdk-solana
# or
npm install @trustless-work/sdk-solana
```

## Core Usage (Node / Browser / Any Framework)

```ts
import { TrustlessWork } from '@trustless-work/sdk-solana'

const tw = new TrustlessWork({ baseURL: 'http://localhost:3000' })

// 1. Authenticate
const { token } = await tw.auth.requestApiKey({ wallet: 'YourWallet...' })
tw.setApiKey(token)

// 2. Deploy an escrow (returns unsigned transaction)
const res = await tw.deployer.deploySingleRelease({
  signer: 'YourWallet...',
  engagementId: 'eng-001',
  title: 'My Escrow',
  description: 'Test escrow',
  approver: 'ApproverPubkey...',
  serviceProvider: 'SPPubkey...',
  platformAddress: 'PlatformPubkey...',
  amount: '100',
  platformFee: '5',
  milestones: [{ description: 'Deliver MVP', status: 'pending', evidence: '' }],
  releaseSigner: 'ReleasePubkey...',
  disputeResolver: 'DisputePubkey...',
  trustline: 'TokenMint...',
  trustlineDecimals: 6,
  receiver: 'ReceiverPubkey...',
  receiverMemo: 0,
})

// 3. Sign with your wallet (not SDK's responsibility)
const signed = await signTransaction(res.unsignedTransaction)

// 4. Send the signed transaction
await tw.helper.sendTransaction({
  signedXdr: signed,
  queueKey: res.contract_id!,
})
```

## React Usage

```tsx
import { TrustlessWorkConfig, useDeploySingleRelease, useSendTransaction } from '@trustless-work/sdk-solana/react'

// Wrap your app
function App() {
  return (
    <TrustlessWorkConfig baseURL="http://localhost:3000" apiKey={token}>
      <EscrowCreator />
    </TrustlessWorkConfig>
  )
}

// Use hooks in components
function EscrowCreator() {
  const { deploySingleRelease } = useDeploySingleRelease()
  const { sendTransaction } = useSendTransaction()

  const handleCreate = async () => {
    const res = await deploySingleRelease({ signer: '...', /* ... */ })
    const signed = await signTransaction(res.unsignedTransaction)
    await sendTransaction({ signedXdr: signed, queueKey: res.contract_id! })
  }

  return <button onClick={handleCreate}>Create Escrow</button>
}
```

## Available Modules

| Module | Methods |
|--------|---------|
| `auth` | `requestApiKey` |
| `deployer` | `deploySingleRelease`, `deployMultiRelease` |
| `escrow` | `fundEscrow`, `releaseFunds`, `resolveDispute`, `changeMilestoneApprovedFlag`, `changeMilestoneStatus`, `changeDisputeFlag`, `updateEscrow`, `getEscrow` |
| `multiRelease` | `fundEscrow`, `changeMilestoneStatus`, `approveMilestone`, `releaseMilestoneFunds`, `disputeMilestone`, `resolveMilestoneDispute`, `withdrawRemainingFunds` |
| `helper` | `sendTransaction`, `setTrustline`, `getMultipleEscrowBalance` |
| `compliance` | `initializeRegistry`, `verifyAddress`, `revokeVerification`, `setEscrowCompliance`, `setTravelRuleData`, `getRegistry`, `getVerification`, `getEscrowCompliance`, `getAuditLogs`, `getSuspiciousActivity`, `getEscrowsBySigner`, `getEscrowsByRole`, `getEscrowsByEngagement` |

## Error Handling

```ts
import { TrustlessWorkError } from '@trustless-work/sdk-solana'

try {
  await tw.escrow.fundEscrow({ ... })
} catch (err) {
  if (err instanceof TrustlessWorkError) {
    console.error(err.message, err.status, err.data)
  }
}
```

## License

MIT
