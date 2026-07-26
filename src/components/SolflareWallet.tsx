import React, { useState, useEffect } from "react";
import { Wallet, Check, AlertCircle, Coins, ExternalLink, Loader2 } from "lucide-react";
import { WalletState } from "../types";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Language } from "../data/translations";

interface SolflareWalletProps {
  wallet: WalletState;
  onWalletChange: (newWallet: WalletState) => void;
  lang: Language;
}

export default function SolflareWallet({ wallet, onWalletChange, lang }: SolflareWalletProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const [isAirdropping, setIsAirdropping] = useState(false);

  useEffect(() => {
    const updateBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          onWalletChange({
            connected: true,
            publicKey: publicKey.toBase58(),
            balance: balance / LAMPORTS_PER_SOL,
            isSimulated: false,
          });
        } catch (err: any) {
          console.error("Failed to fetch balance", err);
        }
      } else if (!connected && wallet.connected) {
        onWalletChange({
          connected: false,
          publicKey: null,
          balance: 0,
          isSimulated: false,
        });
      }
    };

    updateBalance();
    
    let interval: NodeJS.Timeout;
    if (connected && publicKey) {
      interval = setInterval(updateBalance, 10000);
    }
    
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  const handleFaucetClaim = async () => {
    if (!publicKey || !connected) return;
    
    setIsAirdropping(true);
    setError(null);
    try {
      const signature = await connection.requestAirdrop(publicKey, 5 * LAMPORTS_PER_SOL);
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature
      });
      
      const newBalance = await connection.getBalance(publicKey);
      onWalletChange({
        ...wallet,
        balance: newBalance / LAMPORTS_PER_SOL,
      });
    } catch (err: any) {
      console.error("Airdrop failed:", err);
      setError(err?.message || "Failed to airdrop SOL. Devnet faucet might be rate-limiting.");
    } finally {
      setIsAirdropping(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div id="solflare-wallet-card" className="bg-surface border border-border rounded-2xl p-5 md:p-6 max-w-md w-full text-text">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-primary/15 text-primary rounded-xl">
              <Wallet className="h-6 w-6" id="wallet-icon-svg" />
            </div>
            {wallet.connected && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-surface inline-block animate-pulse" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-base text-text uppercase tracking-tight leading-none">Solana Node Wallet</h3>
            <span className="text-[11px] font-sans text-text-muted block mt-1">
              {wallet.connected ? "Network: Solana Devnet" : "Waiting for connection"}
            </span>
          </div>
        </div>
        {wallet.connected && (
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/30">
            {wallet.isSimulated ? "SANDBOX" : "DEVNET"}
          </span>
        )}
      </div>

      {!wallet.connected ? (
        <div className="space-y-3">
          <p className="text-xs font-sans text-text-muted leading-relaxed text-left">
            Connect your Solflare Wallet to sign physical card trade transactions and buy packs on Solana Devnet.
          </p>

          <div className="flex justify-center py-2 [&_.wallet-adapter-button]:!bg-primary [&_.wallet-adapter-button]:hover:!bg-primary-hover [&_.wallet-adapter-button]:!h-auto [&_.wallet-adapter-button]:!py-2.5 [&_.wallet-adapter-button]:!px-4 [&_.wallet-adapter-button]:!rounded-lg [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-bold [&_.wallet-adapter-button]:!text-xs [&_.wallet-adapter-button]:!uppercase [&_.wallet-adapter-button]:!tracking-wider [&_.wallet-adapter-button]:!transition [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!flex [&_.wallet-adapter-button]:!justify-center">
            <WalletMultiButton />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-xs font-mono text-left mt-2">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-surface-2 border border-border rounded-xl p-3.5 space-y-2 text-left">
            <div className="flex justify-between items-center text-[11px] font-sans font-bold text-text-muted">
              <span>SOLANA ADDRESS:</span>
              <span className="text-success font-bold font-mono text-[11px] flex items-center">
                <Check className="h-3 w-3 mr-0.5" /> VERIFIED
              </span>
            </div>
            <div className="font-mono text-xs text-text select-all break-all bg-surface p-2 rounded border border-border">
              {wallet.publicKey}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border text-xs font-sans">
              <span className="text-text-muted">SOLANA BALANCE:</span>
              <span className="font-mono font-bold text-gold flex items-center space-x-1">
                <span>{wallet.balance.toFixed(2)} SOL</span>
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {!wallet.isSimulated && (
              <button
                id="btn-solana-faucet-airdrop"
                onClick={handleFaucetClaim}
                disabled={isAirdropping}
                className="flex-1 py-2 px-3 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold font-bold text-xs font-sans transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAirdropping ? (
                  <Loader2 className="h-3.5 w-3.5 text-gold animate-spin" />
                ) : (
                  <Coins className="h-3.5 w-3.5 text-gold" />
                )}
                <span>{isAirdropping ? "AIRDROPPING..." : "AIRDROP +5 SOL"}</span>
              </button>
            )}

            <button
              id="btn-disconnect-solana"
              onClick={handleDisconnect}
              className="py-2 px-3 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger font-sans font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>DISCONNECT</span>
            </button>
          </div>
          
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-[11px] font-mono text-left">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
