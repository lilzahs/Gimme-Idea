# Blockchain Integration & Payment System

## Overview

A comprehensive blockchain integration system that handles USDC/SOL payments, transaction verification, bounty escrow, donations, and tips on the Solana blockchain.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────┐
│         Frontend (Wallet Adapter)           │
│  - Connect Wallet                            │
│  - Sign Transactions                         │
│  - Display Balances                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          Solana Web3.js                      │
│  - Build Transactions                        │
│  - Send to Network                           │
│  - Get Transaction Status                    │
└─────────────────┬───────────────────────────┘
                  │
                  ├──────────────┬──────────────┐
                  ▼              ▼              ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Solana     │ │   Backend    │ │    Smart     │
        │   Network    │ │  Verification│ │   Contract   │
        │  (Mainnet)   │ │   Service    │ │   (Anchor)   │
        └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Smart Contract (Bounty Escrow)

### Program Overview

**Location**: `programs/gimme-idea/`

**Framework**: Anchor 0.29.0

**Language**: Rust

**Network**: Solana Devnet/Mainnet

### Instructions

#### 1. initialize_bounty

Lock funds into escrow for a project bounty.

```rust
pub fn initialize_bounty(
    ctx: Context<InitializeBounty>,
    bounty_amount: u64,
    project_id: String
) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    bounty.owner = ctx.accounts.owner.key();
    bounty.project_id = project_id;
    bounty.amount = bounty_amount;
    bounty.released = false;
    bounty.bump = *ctx.bumps.get("bounty").unwrap();
    
    // Transfer SOL to escrow PDA
    anchor_lang::solana_program::program::invoke(
        &anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &bounty.key(),
            bounty_amount,
        ),
        &[
            ctx.accounts.owner.to_account_info(),
            bounty.to_account_info(),
        ],
    )?;
    
    msg!("Bounty initialized: {} lamports", bounty_amount);
    Ok(())
}
```

#### 2. release_bounty

Release bounty to a reviewer/contributor.

```rust
pub fn release_bounty(
    ctx: Context<ReleaseBounty>,
    recipient: Pubkey
) -> Result<()> {
    require!(!ctx.accounts.bounty.released, ErrorCode::AlreadyReleased);
    require!(
        ctx.accounts.bounty.owner == ctx.accounts.owner.key(),
        ErrorCode::Unauthorized
    );
    
    let bounty = &mut ctx.accounts.bounty;
    let amount = bounty.amount;
    
    // Transfer from escrow to recipient
    **bounty.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.recipient.try_borrow_mut_lamports()? += amount;
    
    bounty.released = true;
    bounty.recipient = Some(recipient);
    
    msg!("Bounty released to {}", recipient);
    Ok(())
}
```

#### 3. cancel_bounty

Cancel bounty and refund to owner.

```rust
pub fn cancel_bounty(ctx: Context<CancelBounty>) -> Result<()> {
    require!(!ctx.accounts.bounty.released, ErrorCode::AlreadyReleased);
    require!(
        ctx.accounts.bounty.owner == ctx.accounts.owner.key(),
        ErrorCode::Unauthorized
    );
    
    let bounty = &mut ctx.accounts.bounty;
    let amount = bounty.amount;
    
    // Refund to owner
    **bounty.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.owner.try_borrow_mut_lamports()? += amount;
    
    bounty.released = true;
    
    msg!("Bounty cancelled and refunded");
    Ok(())
}
```

### Account Structures

```rust
#[account]
pub struct Bounty {
    pub owner: Pubkey,         // Project owner
    pub project_id: String,     // Database project ID
    pub amount: u64,            // Bounty amount in lamports
    pub released: bool,
    pub recipient: Option<Pubkey>,
    pub bump: u8,
}
```

### Deployment

```bash
# Build program
anchor build

# Deploy to Devnet
anchor deploy --provider.cluster devnet

# Deploy to Mainnet
anchor deploy --provider.cluster mainnet
```

---

## Payment Flows

### 1. Project Donation

**Flow**:
1. User clicks "Donate" on project
2. Opens `PaymentModal` with amount input
3. User approves transaction in wallet
4. Frontend sends transaction to Solana
5. Backend verifies transaction on-chain
6. Updates project donation total
7. Creates notification for project author

**Code Example**:

```typescript
// Frontend
const handleDonate = async (projectId: string, amount: number) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(projectOwnerWallet),
      lamports: amount * LAMPORTS_PER_SOL
    })
  );
  
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  // Verify on backend
  await api.post('/api/payments/verify', {
    txHash: signature,
    projectId,
    amount,
    type: 'donation'
  });
};
```

### 2. Comment Tip

**Flow**:
1. User clicks tip button on comment
2. Opens tip modal (predefined amounts: 0.1, 0.5, 1, 5 SOL)
3. Sends SOL to comment author
4. Backend verifies and updates comment `tips_amount`
5. Notifies comment author

### 3. Bounty Creation

**Flow**:
1. Project author sets bounty amount during submission
2. Calls smart contract `initialize_bounty`
3. SOL locked in escrow (PDA)
4. Backend records bounty in database

### 4. Bounty Release

**Flow**:
1. Project author selects best feedback
2. Calls `release_bounty` with reviewer's wallet
3. Smart contract transfers SOL from escrow to reviewer
4. Backend updates transaction status

---

## Database Schema

### transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Transaction Info
  tx_hash VARCHAR(255) UNIQUE NOT NULL,
  from_wallet VARCHAR(255) NOT NULL,
  to_wallet VARCHAR(255) NOT NULL,
  amount NUMERIC(18, 9) NOT NULL,
  
  -- Type
  type VARCHAR(50) NOT NULL CHECK (type IN ('tip', 'bounty', 'reward', 'donation')),
  
  -- References
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'failed')
  ),
  
  -- Blockchain
  block_number BIGINT,
  fee NUMERIC(18, 9),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

---

## Backend Implementation

### Payment Service

**Location**: `backend/src/payments/payments.service.ts`

#### verifyTransaction()

```typescript
async verifyTransaction(dto: VerifyTransactionDto): Promise<Transaction> {
  const { txHash, amount, fromWallet, toWallet, type, projectId } = dto;
  
  try {
    // 1. Fetch transaction from Solana
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const tx = await connection.getParsedTransaction(txHash, {
      commitment: 'confirmed'
    });
    
    if (!tx) {
      throw new BadRequestException('Transaction not found');
    }
    
    // 2. Verify transaction details
    const isValid = this.validateTransaction(tx, {
      from: fromWallet,
      to: toWallet,
      amount,
      type
    });
    
    if (!isValid) {
      throw new BadRequestException('Transaction validation failed');
    }
    
    // 3. Check for duplicate
    const existing = await this.db.transactions.findUnique({
      where: { tx_hash: txHash }
    });
    
    if (existing) {
      throw new BadRequestException('Transaction already recorded');
    }
    
    // 4. Record in database
    const transaction = await this.db.transactions.create({
      data: {
        tx_hash: txHash,
        from_wallet: fromWallet,
        to_wallet: toWallet,
        amount,
        type,
        project_id: projectId,
        user_id: dto.userId,
        status: 'confirmed',
        block_number: tx.slot,
        fee: tx.meta?.fee / LAMPORTS_PER_SOL || 0
      }
    });
    
    // 5. Update project/comment totals
    if (type === 'donation' && projectId) {
      await this.updateProjectDonations(projectId, amount);
    }
    
    // 6. Create notification
    await this.createDonationNotification(transaction);
    
    return transaction;
    
  } catch (error) {
    console.error('Transaction verification failed:', error);
    throw error;
  }
}
```

#### validateTransaction()

```typescript
private validateTransaction(
  tx: ParsedTransactionWithMeta,
  expected: {
    from: string;
    to: string;
    amount: number;
    type: string;
  }
): boolean {
  // Check transaction success
  if (tx.meta?.err) {
    return false;
  }
  
  // For SOL transfers
  const preBalances = tx.meta.preBalances;
  const postBalances = tx.meta.postBalances;
  const accountKeys = tx.transaction.message.accountKeys;
  
  // Find sender and receiver indexes
  const fromIndex = accountKeys.findIndex(
    key => key.pubkey.toString() === expected.from
  );
  const toIndex = accountKeys.findIndex(
    key => key.pubkey.toString() === expected.to
  );
  
  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }
  
  // Calculate actual transfer amount
  const sentAmount = preBalances[fromIndex] - postBalances[fromIndex];
  const receivedAmount = postBalances[toIndex] - preBalances[toIndex];
  const expectedLamports = expected.amount * LAMPORTS_PER_SOL;
  
  // Allow small fee discrepancy
  const tolerance = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL
  
  return (
    Math.abs(sentAmount - expectedLamports) < tolerance &&
    receivedAmount >= expectedLamports - tolerance
  );
}
```

#### For SPL Token (USDC) Verification

```typescript
private async validateUSDCTransaction(
  tx: ParsedTransactionWithMeta,
  expected: { from: string; to: string; amount: number }
): Promise<boolean> {
  // Find SPL Token transfer instruction
  const tokenTransfer = tx.transaction.message.instructions.find(
    (ix) => {
      if ('parsed' in ix) {
        return (
          ix.parsed?.type === 'transfer' &&
          ix.program === 'spl-token'
        );
      }
      return false;
    }
  );
  
  if (!tokenTransfer || !('parsed' in tokenTransfer)) {
    return false;
  }
  
  const info = tokenTransfer.parsed.info;
  
  // USDC has 6 decimals
  const expectedAmount = expected.amount * 1e6;
  const actualAmount = parseInt(info.amount);
  
  return (
    info.source === expected.from &&
    info.destination === expected.to &&
    actualAmount >= expectedAmount
  );
}
```

### API Endpoints

```typescript
@Controller('payments')
export class PaymentsController {
  
  @Post('verify')
  @UseGuards(AuthGuard)
  async verifyTransaction(
    @CurrentUser('userId') userId: string,
    @Body() dto: VerifyTransactionDto
  ) {
    return this.paymentsService.verifyTransaction({
      ...dto,
      userId
    });
  }
  
  @Get('history')
  @UseGuards(AuthGuard)
  async getTransactionHistory(
    @CurrentUser('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string
  ) {
    return this.paymentsService.getHistory(userId, {
      page,
      limit,
      type
    });
  }
  
  @Get('stats')
  @UseGuards(AuthGuard)
  async getPaymentStats(@CurrentUser('userId') userId: string) {
    return this.paymentsService.getUserStats(userId);
  }
}
```

---

## Frontend Components

### PaymentModal

**Location**: `frontend/components/PaymentModal.tsx` (21KB)

**Features**:
- Amount input with preset buttons
- SOL/USDC toggle
- Wallet balance display
- Transaction preview
- Gas fee estimation
- Confirmation UI
- Success/error handling
- Transaction explorer link

**Key State**:
```typescript
const [amount, setAmount] = useState(0);
const [token, setToken] = useState<'SOL' | 'USDC'>('SOL');
const [loading, setLoading] = useState(false);
const [txSignature, setTxSignature] = useState('');
```

### Donate Component

**Location**: `frontend/components/Donate.tsx` (31KB)

**Purpose**: Platform donation page

**Features**:
- Multiple donation tiers
- Leaderboard of top donors
- Impact metrics
- Platform wallet display
- QR code for donations
- Donation history

---

## Wallet Integration

### Supported Wallets

- **Phantom**
- **Solflare**
- **Backpack**
- **Glow**
- **Slope**
- **Sollet**
- **Ledger** (hardware wallet)

### Wallet Adapter Setup

```typescript
// frontend/components/WalletProvider.tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

const network = WalletAdapterNetwork.Mainnet;
const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
  new BackpackWalletAdapter(),
];

export const SolanaWalletProvider = ({ children }) => {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

---

## Progress & Status

### ✅ Completed

1. ✅ Wallet adapter integration
2. ✅ SOL payment flows
3. ✅ Transaction verification
4. ✅ Donation system
5. ✅ Tip system
6. ✅ Smart contract (basic escrow)
7. ✅ Payment modals and UI
8. ✅ Transaction history
9. ✅ Wallet connection flow
10. ✅ Multi-wallet support

### 🚧 In Progress

1. 🚧 USDC integration (SPL tokens)
2. 🚧 Advanced escrow features
3. 🚧 Automated bounty distribution
4. 🚧 Payment analytics dashboard

### 📋 Planned

1. 📋 Multi-signature escrow
2. 📋 Time-locked releases
3. 📋 Dispute resolution mechanism
4. 📋 Subscription payments
5. 📋 Batch  payments
6. 📋 Cross-chain bridge integration
7. 📋 Fiat on/off ramp
8. 📋 Tax reporting tools
9. 📋 Payment splitting
10. 📋 Recurring donations

---

## Security Considerations

### Transaction Verification

1. **On-chain Verification**: Always verify on Solana blockchain
2. **Duplicate Prevention**: Check transaction hash uniqueness
3. **Amount Validation**: Verify exact amounts transferred
4. **Wallet Verification**: Confirm sender/receiver addresses
5. **Status Confirmation**: Wait for sufficient confirmations

### Smart Contract Security

1. **Owner Verification**: Only bounty owner can release/cancel
2. **Double-spend Protection**: Check `released` flag
3. **PDA Seeds**: Use project_id to prevent collisions
4. **Signer Checks**: All critical operations require signatures

### Best Practices

```typescript
// Always use try-catch
try {
  const tx = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(tx, 'confirmed');
} catch (error) {
  if (error.message.includes('User rejected')) {
    // Handle rejection
  } else {
    // Handle other errors
  }
}

// Set reasonable timeouts
const confirmation = await connection.confirmTransaction(
  signature,
  {
    commitment: 'confirmed',
    maxRetries: 3
  }
);
```

---

## Testing

### Unit Tests

```typescript
describe('PaymentService', () => {
  it('should verify valid SOL transaction', async () => {
    const result = await paymentService.verifyTransaction({
      txHash: 'valid_signature',
      amount: 1.0,
      fromWallet: 'user_wallet',
      toWallet: 'recipient_wallet',
      type: 'donation'
    });
    
    expect(result.status).toBe('confirmed');
  });
  
  it('should reject invalid transaction', async () => {
    await expect(
      paymentService.verifyTransaction({
        txHash: 'invalid_signature',
        amount: 1.0,
        fromWallet: 'user_wallet',
        toWallet: 'recipient_wallet',
        type: 'donation'
      })
    ).rejects.toThrow();
  });
});
```

### Integration Tests

- End-to-end donation flow
- Escrow creation and release
- Transaction verification pipeline
- Wallet connection and signing

---

## Monitoring & Analytics

### Metrics Tracked

1. **Transaction Volume**:
   - Total volume (SOL/USDC)
   - Daily/weekly/monthly trends
   - Average transaction size

2. **Transaction Success Rate**:
   - Successful vs failed transactions
   - Common failure reasons
   - Retry rates

3. **User Engagement**:
   - Active donors
   - Repeat donors
   - Donation frequency

4. **Smart Contract**:
   - Total bounties created
   - Average bounty size
   - Release vs cancel ratio

### Dashboards

- Real-time transaction monitoring
- Payment analytics
- User payment behavior
- Smart contract usage statistics

---

## Cost Analysis

### Transaction Fees

- **SOL Transfer**: ~0.000005 SOL (~$0.0005)
- **SPL Token Transfer**: ~0.00001 SOL (~$0.001)
- **Smart Contract Call**: ~0.00005 SOL (~$0.005)

### Optimization

- Batch transactions when possible
- Use Solana's low fees to enable micro-transactions
- Implement fee estimation before transactions

---

## Documentation

- [Smart Contract Guide](./smart-contract/README.md)
- [Payment API Reference](./api/payments.md)
- [Wallet Integration Guide](./guides/wallet-integration.md)
- [Transaction Verification](./guides/tx-verification.md)
