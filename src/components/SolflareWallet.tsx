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
  sandboxMode: boolean;
  onToggleSandbox: () => void;
}

export default function SolflareWallet({ wallet, onWalletChange, lang, sandboxMode, onToggleSandbox }: SolflareWalletProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sandboxMode) return;
    
    const updateBalance = async () => {
      if (connected && publicKey) {
        let balance = 0;
        try {
          balance = await connection.getBalance(publicKey);
        } catch (err: any) {
          console.error("Failed to fetch balance", err);
        }
        onWalletChange({
          connected: true,
          publicKey: publicKey.toBase58(),
          balance: balance / LAMPORTS_PER_SOL,
        });
      } else if (!connected && wallet.connected) {
        onWalletChange({
          connected: false,
          publicKey: null,
          balance: 0,
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

  const handleFaucetClaim = () => {
    window.open("https://faucet.solana.com/", "_blank");
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div id="solflare-wallet-card" className="bg-white border border-gray-300 rounded-2xl p-5 md:p-6 shadow-sm max-w-md w-full text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-2 bg-[#002F6C]/10 rounded-lg text-[#002F6C]">
              <Wallet className="h-6 w-6" id="wallet-icon-svg" />
            </div>
            {wallet.connected && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#14F195] border-2 border-white inline-block animate-pulse" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-base text-[#002F6C] uppercase tracking-tight leading-none">Solana Node Wallet</h3>
            <span className="text-[10px] font-serif text-gray-500 italic block mt-1">
              {wallet.connected ? (sandboxMode ? "Network: Sandbox (Mock)" : "Network: Solana Devnet") : "Waiting for connection"}
            </span>
          </div>
        </div>
        {wallet.connected && (
          <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ONLINE
          </span>
        )}
      </div>

      {!wallet.connected ? (
        <div className="space-y-3">
          <p className="text-xs font-serif text-gray-600 leading-relaxed text-left">
            Connect your Solflare Wallet to sign physical card trade transactions and buy packs on Solana Devnet, or enable Sandbox Mode to test instantly without a wallet.
          </p>

          <div className="flex justify-center py-2 [&_.wallet-adapter-button]:!bg-[#002F6C] [&_.wallet-adapter-button]:hover:!opacity-95 [&_.wallet-adapter-button]:!h-auto [&_.wallet-adapter-button]:!py-2.5 [&_.wallet-adapter-button]:!px-4 [&_.wallet-adapter-button]:!rounded-lg [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-bold [&_.wallet-adapter-button]:!text-xs [&_.wallet-adapter-button]:!uppercase [&_.wallet-adapter-button]:!tracking-wider [&_.wallet-adapter-button]:!transition [&_.wallet-adapter-button]:!shadow-sm [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!flex [&_.wallet-adapter-button]:!justify-center">
            <WalletMultiButton />
          </div>

          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-600 font-mono text-left mt-2">
              {error}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onToggleSandbox}
              className="w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-bold text-xs uppercase tracking-wider transition border border-gray-300"
            >
              Enable Sandbox Mode
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#fdfcf7] border border-gray-300 rounded-xl p-3.5 space-y-2 text-left">
            <div className="flex justify-between items-center text-[10px] font-sans font-bold text-gray-400">
              <span>SOLANA ADDRESS:</span>
              <span className="text-emerald-600 font-bold font-mono text-[9px] flex items-center">
                <Check className="h-3 w-3 mr-0.5" /> VERIFIED
              </span>
            </div>
            <div className="font-mono text-xs text-gray-700 select-all break-all bg-white p-2 rounded border border-gray-300">
              {wallet.publicKey}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-sans">
              <span className="text-gray-500">SOLANA BALANCE:</span>
              <span className="font-mono font-bold text-[#002F6C] flex items-center space-x-1">
                <span>{wallet.balance.toFixed(2)} SOL</span>
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
              <button
                id="btn-solana-faucet-airdrop"
                onClick={handleFaucetClaim}
                className="flex-1 py-2 px-3 rounded bg-[#FFCD00]/25 hover:bg-[#FFCD00]/40 text-[#002F6C] font-bold text-xs font-sans transition border border-[#FFCD00]/50 flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Coins className="h-3.5 w-3.5 text-[#002F6C]" />
                <span>MANUAL AIRDROP</span>
              </button>

            <button
              id="btn-disconnect-solana"
              onClick={sandboxMode ? onToggleSandbox : handleDisconnect}
              className="py-2 px-3 rounded hover:bg-rose-50 hover:text-rose-700 text-rose-600 font-sans font-bold text-xs transition border border-rose-200 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{sandboxMode ? "EXIT SANDBOX" : "DISCONNECT"}</span>
            </button>
          </div>
          
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-600 font-mono text-left">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
