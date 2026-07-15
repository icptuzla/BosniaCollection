# Design Specification: Wallet Enhancements & Prediction Game

## 1. Overview
This spec outlines the implementation details for two features:
1. **Wallet Enhancements**: Replacing the broken Devnet auto-airdrop with a manual faucet link, and introducing a "Sandbox Mode" for rapid UI testing without real Web3 signatures.
2. **Prediction Game**: A new feature allowing users to wager SOL or duplicate stickers on the outcome of an upcoming match.

## 2. Wallet & Airdrop Updates

### 2.1 Manual Faucet Link
- **Component**: `SolflareWallet.tsx`
- **Change**: The existing "Auto Airdrop" button will be replaced.
- **Behavior**: Instead of calling `connection.requestAirdrop`, the new UI will instruct users to visit the official Solana faucet (`https://faucet.solana.com`). It will provide a convenient "Copy Address" button and an external link to the faucet site to reduce friction.

### 2.2 Sandbox Demo Mode
- **Component**: `SolflareWallet.tsx` (and global wallet state management in `App.tsx`)
- **UI**: A prominent toggle switch or button labeled "Enable Sandbox Mode".
- **Behavior**:
  - When enabled, the app bypasses the Solflare wallet adapter.
  - Injects a mock wallet state (`connected: true`, mock `publicKey`, and a starting balance of `10.00 SOL`).
  - All transactions (trading, buying packs, playing the prediction game) will bypass the UMI `sendAndConfirm` calls and instead succeed instantly via local state updates.
  - This allows rapid testing of the application's UI and logic without network latency or signature approvals.

## 3. Prediction Game

### 3.1 Match Selection
- **Upcoming Match**: Since Bosnia vs. Canada ended 1:1, the game will feature the **next available match** (e.g., "Bosnia vs. USA" or "Bosnia vs. Brazil", customizable in the data file).

### 3.2 Unified Entry UI (`PredictionGame.tsx`)
- A new dedicated component for match predictions.
- **Prediction Slip**: Users must fill out a unified slip containing three picks:
  1. **Match Outcome**: Win (Bosnia), Draw, or Loss.
  2. **Exact Score**: Two number inputs (e.g., 2 - 1).
  3. **Goal Scorer**: A dropdown menu populated with players from the `STICKERS` database.

### 3.3 Wagering Mechanism
- **Entry Fee**: To submit a prediction slip, the user must choose one of two payment methods:
  - Pay `0.02 SOL`.
  - Burn `1 Duplicate Sticker` from their pouch.
- **Validation**: The system will check the user's wallet balance or their pouch inventory before allowing submission.

### 3.4 Match Simulation & Payouts
- **Simulation**: For demonstration and testing purposes, an admin button labeled "Simulate Match Result" will be available.
- **Resolution**: Clicking the simulate button will randomly generate (or allow the admin to manually input) a final score and goal scorer, then evaluate the user's active prediction slip.
- **Payout Tiers**:
  - **1 out of 3 correct**: Refund (returns 0.02 SOL or 1 generic sticker).
  - **2 out of 3 correct**: Minor Prize (e.g., 0.05 SOL or 1 Booster Pack).
  - **3 out of 3 correct**: Jackpot Prize (e.g., 0.2 SOL or 3 Booster Packs).
- **Effects**: Payouts will directly update the user's wallet balance or sticker inventory.

## 4. Technical Considerations
- **State Management**: The active prediction slip and match results will be stored in the root state (`App.tsx` or similar) so they persist across component unmounts during the session.
- **Mocking**: In Sandbox Mode, burning a sticker or paying SOL will be entirely handled by React state setters. If real Devnet is used, it will simulate the Web3 burn/transfer instructions as previously established in the Trade Market.
