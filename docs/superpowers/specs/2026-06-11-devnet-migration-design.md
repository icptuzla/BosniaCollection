# Devnet Migration Design Specification

## Overview
This document outlines the architecture and implementation details for migrating the BosniaCollection project from a simulated local sandbox to the Solana Devnet. The migration involves updating the wallet connection, implementing on-chain minting for pack openings, and establishing a trustless P2P marketplace using partial transaction signatures.

## 1. Wallet & Faucet Integration

### Architecture
- Remove the local simulated keypair generation and dummy balances in `SolflareWallet.tsx`.
- Integrate `@solana/web3.js` to connect directly to the Solflare wallet extension (or phantom).
- Establish a connection to the `https://api.devnet.solana.com` RPC endpoint.

### Faucet Logic
- The "Airdrop +5 SOL" button will trigger `connection.requestAirdrop(publicKey, 5 * LAMPORTS_PER_SOL)`.
- The application will await transaction confirmation on Devnet before updating the UI balance.

## 2. Pack Opening (Mint on Demand)

### Mechanism
- The price of a booster pack is set to **0.2 SOL**.
- When a user clicks to buy a pack, the application will randomly select 5 sticker metadata configurations based on the predefined pull probabilities.
- Using **Metaplex Core**, the frontend will construct a transaction containing 5 `create` instructions to mint the selected NFTs directly into the user's wallet.
- The user signs the transaction via their connected wallet. The cost of rent exemption for the 5 NFTs is covered by the user.

### User Flow
1. Check wallet connection and ensure DEVNET SOL balance is sufficient.
2. Generate 5 random player metadata JSON references.
3. Build a Solana transaction with 5 Metaplex Core mint instructions.
4. Prompt the user to sign and send the transaction via Solflare.
5. On confirmation, play the "opened pack" animation and display the newly minted NFTs.

## 3. P2P Trading Market

### Trading Architecture
Instead of deploying a custom escrow smart contract, the application will use **Partial Signatures** to facilitate trustless atomic swaps and sales.

### Flow for Listing (Maker)
1. Maker selects an NFT they own (duplicate) and specifies either a requested NFT or a SOL price.
2. The frontend builds the transaction:
   - **For Swap**: Transfer Maker's NFT to Taker, and Transfer Taker's NFT to Maker.
   - **For SOL Sale**: Transfer Maker's NFT to Taker, and Transfer the specified SOL amount from Taker to Maker.
3. Maker signs their portion of the transaction (authorizing the transfer of their asset).
4. The partially signed transaction is serialized to base64/bytes and stored in the application's active trade listings.

### Flow for Accepting (Taker)
1. Taker reviews the listing and clicks to accept.
2. The frontend retrieves the partially signed transaction.
3. Taker's wallet countersigns the transaction, satisfying the signature requirements for all involved assets.
4. The frontend broadcasts the fully signed, valid transaction to the Devnet RPC.
5. Upon confirmation, the assets are swapped atomically on-chain.
