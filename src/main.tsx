import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// ── Polyfill Buffer for production Vite/Vercel builds ─────────────────────────
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  (window as any).Buffer = (window as any).Buffer ?? Buffer;
  (window as any).global = (window as any).global ?? window;
  (window as any).process = (window as any).process ?? { env: {} };
}

// ── Error boundary: keeps the App alive if Solana providers crash ──────────────
interface EBState { hasError: boolean; error?: Error }
class SolanaErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(error: Error): EBState { return { hasError: true, error }; }
  componentDidCatch(error: Error) { console.error('[SolanaErrorBoundary]', error); }
  render() {
    if (this.state.hasError) {
      // Render App without wallet context so the UI still shows
      return <App />;
    }
    return this.props.children;
  }
}

const network = import.meta.env.VITE_SOLANA_NETWORK === 'mainnet'
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Devnet;

const endpoint = import.meta.env.VITE_SOLANA_DEVNET_NETWORK || clusterApiUrl(network);
const wallets = [new SolflareWalletAdapter()];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <App />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaErrorBoundary>
  </StrictMode>,
);
