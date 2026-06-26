# Implementation Plan: On-Chain Card Minting to Solflare on Solana Devnet

## Phase 1: Local Storage Mint State in `App.tsx`
1. **Initialize State**:
   * Add a new state `mintedStickers` in `src/App.tsx` initialized from `localStorage` under key `bosnia_wc26_minted_stickers`.
   * Implement a helper function `handleRegisterMint(id: number)` that appends the sticker ID to `mintedStickers` and persists it to `localStorage`.
2. **Prop Drilling**:
   * Pass `mintedStickers` and `onMintSticker` down to the `CardDetail` modal inside `App.tsx`'s return block.
   * Pass `sandboxMode` down to `CardDetail` to identify if actual Devnet transaction signing is bypassed.

## Phase 2: CardDetail Integration & Metaplex Umi Setup
1. **Imports**:
   * Add Umi and Metaplex Core imports at the top of `src/components/CardDetail.tsx` (namely `createUmi`, `walletAdapterIdentity`, `generateSigner`, `create` from `@metaplex-foundation/mpl-core`, and `@metaplex-foundation/umi`).
2. **Context Hooks**:
   * Add `useWallet` and `useConnection` hooks to `CardDetail.tsx` to retrieve active Solana wallet status and Devnet provider connection.
3. **Umi Setup**:
   * Memoize Umi instance creation using the connected `solanaWallet` and RPC endpoint.
4. **Mint State Check**:
   * Add boolean check `isMinted` (i.e. `mintedStickers.includes(sticker.id)`).
   * Check if user owns the card (meaning `userSticker` exists and `userSticker.count > 0 || userSticker.pasted === true`).

## Phase 3: UI Implementation in `CardDetail.tsx`
1. **Add Button State**:
   * Create an `isMinting` state.
   * Add a "MINT TO SOLFLARE" button in the back footer bar of `CardDetail.tsx` next to the paste button.
   * Render states:
     * **If already minted (`isMinted`)**: Disabled badge showing `"✓ MINTED TO WALLET"`.
     * **If not owned**: No button or disabled message (already handled: button is only clickable if owned).
     * **If owned and not minted**: Blue button styled consistent with other theme buttons.
     * **If `isMinting` is true**: Disabled loading state showing `"MINTING..."`.

## Phase 4: Minting Logic execution in `CardDetail.tsx`
1. **`handleMintSticker` function**:
   * Perform validations (wallet connected, balance check if not in sandbox mode).
   * If `sandboxMode` is enabled:
     * Simulate a 1.2s delay.
     * Trigger `onMintSticker(sticker.id)`.
     * Show success alert.
   * If on Devnet:
     * Set `isMinting(true)`.
     * Generate new signer `assetSigner = generateSigner(umi)`.
     * Construct and call `create` from Metaplex Core, passing metadata URI pointing to card's image (`https://bafybeihntowy3cfvf2defm5jiohxxq7lkh6wrrkdr7n5re5yifgvh3upte.ipfs.dweb.link?filename=[imageFile]`).
     * Call `sendAndConfirm(umi)`.
     * Trigger `onMintSticker(sticker.id)` on success.
     * Alert user and catch/display any errors.
     * Reset `isMinting(false)`.

## Phase 5: PackOpener Asset Correction
1. **Update `PackOpener.tsx`**:
   * Change `"GoldenCrest.png": goldenCrestImg` to `"GoldenCrest.webp": goldenCrestImg` at line 85 of `src/components/PackOpener.tsx`.

## Phase 6: Testing & QA
1. **Verify Sandbox mode**: Verify individual cards can be minted with instant success simulation and local storage updates.
2. **Verify Devnet mode**: Verify real Solflare signature triggers and NFTs are recorded on Solana Devnet.
