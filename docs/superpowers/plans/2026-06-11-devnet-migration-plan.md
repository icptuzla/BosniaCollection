# Implementation Plan: Solana Devnet Migration

## Phase 1: Wallet & Faucet Integration
1. **Dependencies**: 
   - Ensure `@solana/web3.js` and `@solana/wallet-adapter-react` (plus UI components) are installed.
2. **Update `SolflareWallet.tsx`**:
   - Replace the simulated key generator with `@solana/wallet-adapter-react` hooks (e.g., `useWallet`, `useConnection`).
   - Remove the `fakeAddress` and random balance logic.
   - Connect the UI elements to the actual wallet state (publicKey, connected, etc.).
3. **Airdrop Functionality**:
   - Update `handleFaucetClaim` to use `connection.requestAirdrop(publicKey, 5 * LAMPORTS_PER_SOL)`.
   - Add a loader state while awaiting transaction confirmation.
   - Refresh the actual wallet balance post-airdrop.

## Phase 2: Pack Opening (Mint on Demand)
1. **Metaplex Dependencies**:
   - Install `@metaplex-foundation/umi` and `@metaplex-foundation/mpl-core` if not already present.
2. **Update `PackOpener.tsx`**:
   - Change pack cost to `0.2 SOL`.
   - Remove the dummy `wallet.balance -= packCost` state update.
   - Implement the `handlePurchasePack` flow to:
     a. Fetch 5 random sticker URIs.
     b. Generate 5 `create` instructions via Metaplex Core (creating Asset accounts).
     c. Bundle into a single transaction and request user signature.
     d. Send transaction and await confirmation.
   - Trigger the ripping animation upon successful confirmation.

## Phase 3: P2P Trading Market (Partial Signatures)
1. **Transaction Generation (`TradeMarket.tsx`)**:
   - For a **Swap**: Create a transaction with two `transfer` instructions (User A -> User B, User B -> User A).
   - For a **Sale**: Create a transaction with an NFT `transfer` instruction (User A -> User B) and a `SystemProgram.transfer` instruction for SOL (User B -> User A).
2. **Partial Signing (Maker)**:
   - Maker signs the transaction.
   - Serialize the partially signed transaction and store it in the `tradeOffers` list.
3. **Execution (Taker)**:
   - When Taker accepts, deserialize the transaction.
   - Taker's wallet signs the transaction.
   - Broadcast the transaction to Devnet.
   - Handle success/error feedback in the UI.

## Phase 4: Final Polish
- Ensure error handling is robust (e.g., user rejected request, blockhash expired).
- Test all flows directly against Solana Devnet.
- Clean up any remaining dummy/simulated data blocks.
