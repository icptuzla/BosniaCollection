# Design Specification: On-Chain Card Minting to Solflare on Solana Devnet

## 1. Overview
This document specifies the design for implementing client-side Metaplex Core NFT minting for individual player cards and completion rewards, allowing users to collect cards on the Solana Devnet directly in their Solflare wallet.

## 2. Goals
- Provide a direct "Mint to Solflare" option on the back of each card detail page (`CardDetail.tsx`) for stickers that the user owns (either in the pouch or pasted in the album).
- Integrate the completed album reward minting with the user's Solflare wallet.
- Support both **Sandbox Mode** (mocked state updates and instant success) and **Solana Devnet Mode** (actual Web3 transactions signed by the connected wallet).
- Prevent duplicate minting of the same sticker/reward by persisting the mint state in the browser's local storage.
- Correct the image mapping in `PackOpener.tsx` for the Golden Crest.

## 3. Architecture & Data Flow

### 3.1 Local Storage State
We will maintain a list of already minted sticker IDs in `App.tsx` state:
- **Key**: `bosnia_wc26_minted_stickers`
- **Type**: `number[]` (containing player sticker IDs 1 to 29)
- **Persisted**: LocalStorage synchronization on change.

### 3.2 Component Hierarchy & Props
```
App.tsx (holds mintedStickers state, handles sandbox mode toggle)
 ├── SolflareWallet (sandboxMode state, wallet adapter button)
 ├── AlbumPage (hasClaimedReward, handleMintReward)
 └── CardDetail (owns selected sticker, triggers individual minting)
```
We will pass the following new props to `CardDetail`:
- `mintedStickers: number[]`
- `onMintSticker: (id: number) => void`
- `sandboxMode: boolean`

### 3.3 Metaplex Umi Integration
In `CardDetail.tsx`, we will initialize the Metaplex `umi` instance similarly to `AlbumPage.tsx`:
```typescript
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { generateSigner } from "@metaplex-foundation/umi";
import { create } from "@metaplex-foundation/mpl-core";
```

## 4. Minting Process Flow

```
[ User opens owned card ]
          │
          ▼
[ Flip to back of card ]
          │
          ▼
[ Click "Mint to Solflare" ]
          │
    ┌─────┴────────────────────────┐
    ▼                              ▼
[ Sandbox Mode ]          [ Solana Devnet Mode ]
    │                              │
    │                              ▼
    │                   [ Check Solana Wallet & RPC ]
    │                              │
    │                              ▼
    │                   [ Build Metaplex Core create Tx ]
    │                              │
    │                              ▼
    │                   [ Wallet Signature Prompt ]
    │                              │
    │                              ▼
    │                   [ Send & Confirm on Devnet ]
    │                              │
    └─────────────┬────────────────┘
                  ▼
   [ Add ID to mintedStickers ]
                  │
                  ▼
[ Disable Mint Button (Show "✓ Minted") ]
```

## 5. UI Elements

### 5.1 CardDetail Mint Button
On the back face of the card (`CardDetail.tsx`), next to the paste button:
- **Disabled State (Not Owned)**: Hide button or show "Not owned to mint".
- **Default State (Owned & Not Minted)**: Show a button with style consistent with the theme (Blue background with yellow hover effect: "MINT TO WALLET").
- **Loading State (Minting in Progress)**: Show a disabled loading button: "MINTING...".
- **Success State (Already Minted)**: Show a green border/badge: "✓ MINTED TO WALLET".

### 5.2 Golden Crest Correction in `PackOpener.tsx`
Change `"GoldenCrest.png": goldenCrestImg` to `"GoldenCrest.webp": goldenCrestImg` at line 85 of `PackOpener.tsx`.

## 6. Testing & Validation Plan
- **Sandbox Test**: Enable Sandbox Mode in the wallet tab, open Edin Džeko or Golden Crest details, click Mint. Ensure it completes instantly, alerts success, disables the button, and persists the state on refresh.
- **Devnet Test**: Connect a Solflare wallet on Devnet, fund with faucet, select an owned card, sign the transaction, verify the asset address in the browser console, and verify it appears in the Solflare wallet's collectibles tab.
