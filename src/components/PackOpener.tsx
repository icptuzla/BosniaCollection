import React, { useState } from "react";
import { Sparkles, ShoppingBag, Coins, CreditCard, ArrowRight } from "lucide-react";
import { Sticker, WalletState } from "../types";
import { STICKERS } from "../data/players";

interface PackOpenerProps {
  wallet: WalletState;
  onWalletChange: (newWallet: WalletState) => void;
  onAddStickers: (ids: number[]) => void;
  onViewSticker: (sticker: Sticker) => void;
}

export default function PackOpener({ wallet, onWalletChange, onAddStickers, onViewSticker }: PackOpenerProps) {
  const [isBought, setIsBought] = useState(false);
  const [packStatus, setPackStatus] = useState<"ready" | "tearing" | "opened">("ready");
  const [revealedStickers, setRevealedStickers] = useState<Sticker[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const packCost = 0.5; // cost in SOL

  const handlePurchasePack = () => {
    if (!wallet.connected) {
      alert("Please connect your Solflare or Sandbox Wallet first to buy a packet!");
      return;
    }
    if (wallet.balance < packCost) {
      alert("Insufficient Balance! Claim free faucet SOL in the wallet card first.");
      return;
    }

    // Deduct SOL
    onWalletChange({
      ...wallet,
      balance: Number((wallet.balance - packCost).toFixed(2)),
    });

    // Synthesize laser-gong buy audio
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.31);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (_) {}

    setIsBought(true);
    setPackStatus("ready");
    setHasClaimed(false);
    setRevealedStickers([]);
    setCurrentIndex(0);
  };

  const handleRipPack = () => {
    if (packStatus !== "ready") return;
    setPackStatus("tearing");

    // Synthesize paper ripping static crash sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Noise buffer for realistic paper tear friction
      const bufferSize = audioCtx.sampleRate * 0.25;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.25);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
      noise.stop(audioCtx.currentTime + 0.25);
    } catch (_) {}

    // Pull 5 stickers (approx. 1 high rating/special, 4 standard)
    setTimeout(() => {
      const pulled: Sticker[] = [];
      const totalCount = STICKERS.length;
      
      for (let i = 0; i < 5; i++) {
        let rolled: Sticker;
        
        // Ensure some cool distribution
        if (i === 4) {
          // Guaranteed special or top player (>80 rating) roll
          const excitingList = STICKERS.filter(s => s.id >= 23 || (s.stats && s.stats.overall >= 80));
          rolled = excitingList[Math.floor(Math.random() * excitingList.length)];
        } else {
          // Standard random roll
          rolled = STICKERS[Math.floor(Math.random() * totalCount)];
        }
        pulled.push(rolled);
      }

      setRevealedStickers(pulled);
      setPackStatus("opened");
    }, 850);
  };

  const handleClaimStickers = () => {
    if (hasClaimed) return;
    const ids = revealedStickers.map(s => s.id);
    onAddStickers(ids);
    setHasClaimed(true);

    // Synthesize magic confirmation cash sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (_) {}

    // Reset loop
    setIsBought(false);
    setPackStatus("ready");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-5 md:p-8 bg-white border border-gray-300 rounded-2xl shadow-sm text-gray-800">
      <div className="text-center">
        <h2 className="text-2xl font-sans font-black text-[#002F6C] uppercase tracking-tighter leading-none">
          Sticker Foil Packet Boutique
        </h2>
        <p className="text-xs font-serif italic text-gray-500 mt-1">
          Purchase & rip packs of 5 random Bosnian collectibles on the Solana chain!
        </p>
      </div>

      {!isBought ? (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4 w-full">
          {/* Visual Foil Packet placeholder */}
          <div className="relative w-56 h-72 rounded-2xl bg-gradient-to-br from-[#002F6C] via-[#092244] to-[#124285] border-4 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.6)] flex flex-col justify-between p-4 flex-shrink-0 animate-bounce-slow text-white">
            {/* Crinkled Foil texture borders */}
            <div className="absolute top-0 inset-x-0 h-4 bg-[#FFCD00] flex items-center justify-center space-x-1 font-sans text-[7px] text-[#002F6C] font-black overflow-hidden tracking-widest">
              <span>★ BOSNA ★ ZMAJEVI ★ BIH ★</span>
            </div>

            <div className="my-auto text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-950/40 border border-white/20 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="h-8 w-8 text-[#FFCD00] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-sans font-bold tracking-wider text-gray-300 uppercase block">PANINI STYLE</span>
                <h3 className="font-sans font-black text-xl tracking-tight text-white uppercase leading-none mt-1">
                  WC2026 Booster
                </h3>
              </div>
            </div>

            <div className="bg-slate-950/50 py-1.5 px-2 rounded-lg border border-white/10 text-center font-mono text-[9px] text-[#FFCD00] font-black">
              5 PREMIUM STICKERS
            </div>
            
            <div className="absolute bottom-0 inset-x-0 h-4 bg-[#FFCD00]" />
          </div>

          <div className="space-y-4 max-w-sm text-center md:text-left">
            <h3 className="font-sans font-black text-xl text-[#002F6C] uppercase tracking-tight">Purchase Zmajevi Pack</h3>
            <p className="text-gray-600 text-xs font-serif italic leading-relaxed">
              Each packet is minted directly onto the Solana Blockchain upon purchase, distributing 22 unique players and 4 special holographic collection elements randomly.
            </p>

            <div className="bg-white border border-gray-300 p-4 rounded-xl flex items-center justify-between shadow-sm text-gray-850">
              <div className="text-left">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">PRICE PER PACKET:</span>
                <span className="text-lg font-sans font-black text-[#002F6C] flex items-center space-x-1 mt-0.5">
                  <Coins className="h-4.5 w-4.5 text-[#FFCD00] mr-1" />
                  <span>{packCost} SOL</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">CURRENT WALLET:</span>
                <span className="text-xs font-mono font-bold text-[#002F6C] mt-1 block">
                  {wallet.connected ? `${wallet.balance.toFixed(2)} SOL` : "Not Connected"}
                </span>
              </div>
            </div>

            <button
              id="btn-buy-booster-packet"
              onClick={handlePurchasePack}
              className="w-full flex items-center justify-center space-x-1.5 py-3 px-6 rounded-xl bg-[#002F6C] hover:bg-[#0c3e80] text-white font-sans font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Purchase Pack for {packCost} SOL</span>
            </button>
            
            {!wallet.connected && (
              <p className="text-[10px] font-sans font-bold text-rose-500 text-center">
                * Please connect the Solflare node or Sandbox wallet card above!
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Ripping envelope / Revealing stickers */
        <div className="w-full py-4 flex flex-col items-center">
          {packStatus === "ready" && (
            <div className="flex flex-col items-center space-y-6">
              <p className="text-xs font-serif text-[#002F6C] font-bold animate-pulse">
                ✓ Pack secured on Solana devnet! Ready to open.
              </p>
              
              {/* Interaction - Tear top of foil pack */}
              <div
                id="interactive-tear-envelope"
                onClick={handleRipPack}
                className="group relative w-60 h-80 rounded-2xl bg-gradient-to-br from-[#002F6C] to-[#124285] border-4 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.65)] flex flex-col justify-center items-center p-4 cursor-pointer hover:border-[#00e5ff] hover:shadow-[0_0_30px_rgba(0,240,255,0.9)] transition shrink-0 text-white"
              >
                <div className="absolute top-0 inset-x-0 h-8 bg-[#FFCD00] group-hover:bg-[#FFD700] transition flex items-center justify-center overflow-hidden border-b-2 border-dashed border-slate-950">
                  <span className="font-sans text-[10px] text-[#002F6C] font-black tracking-widest animate-pulse">
                    CLICK TO RIP OPEN
                  </span>
                </div>

                <div className="text-center space-y-2">
                  <Sparkles className="h-10 w-10 text-white mx-auto animate-pulse" />
                  <p className="text-xl font-sans font-black uppercase tracking-tight text-white leading-none">
                    RIP ME!
                  </p>
                  <p className="text-[9px] font-sans font-bold uppercase tracking-widest opacity-60">Click anywhere to open foil sleeve</p>
                </div>
              </div>
            </div>
          )}

          {packStatus === "tearing" && (
            <div className="flex flex-col items-center py-20 space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-[#002F6C] border-t-transparent animate-spin" />
              <p className="text-[#002F6C] font-serif italic text-sm animate-pulse">Ripping foil envelope & loading blockchain entropy...</p>
            </div>
          )}

          {packStatus === "opened" && (
            <div className="space-y-6 w-full flex flex-col items-center">
              
              {/* Stack / Viewer Carousel of Pulled Stickers */}
              <div className="flex flex-col items-center space-y-4 w-full text-gray-800">
                <div className="text-[10px] font-sans font-bold tracking-widest text-[#002F6C] uppercase bg-[#002F6C]/10 py-1.5 px-3 rounded">
                  Pulled sticker CARD {currentIndex + 1} of {revealedStickers.length}
                </div>

                <div className="flex items-center space-x-6">
                  {/* Left arrow */}
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="p-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-650 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-sm font-bold text-sm"
                  >
                    ←
                  </button>

                  {/* Pack Sticker Display - Clickable to launch 600px x 700px Card modal */}
                  <div
                    onClick={() => onViewSticker(revealedStickers[currentIndex])}
                    className="relative w-64 h-80 rounded-2xl p-4.5 bg-white border-4 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.6)] flex flex-col justify-between cursor-pointer hover:scale-105 hover:shadow-[0_0_28px_rgba(0,240,255,0.85)] transition-all text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#002F6C]/5 to-transparent mix-blend-overlay pointer-events-none rounded-xl" />

                    <div className="flex justify-between items-start">
                      <span className="font-sans text-[10px] font-black px-1.5 py-0.5 bg-[#FFCD00] text-[#002F6C] rounded shadow-sm">
                        {revealedStickers[currentIndex].number}
                      </span>
                      {revealedStickers[currentIndex].stats && (
                        <span className="font-sans text-xs font-black text-[#002F6C] uppercase bg-[#002F6C]/10 px-1 rounded">
                          OVR {revealedStickers[currentIndex].stats?.overall}
                        </span>
                      )}
                    </div>

                    <div className="my-auto text-left py-2">
                      <div className="text-[9px] font-sans font-bold text-[#002F6C] block leading-none opacity-60 mb-1">
                        {revealedStickers[currentIndex].role}
                      </div>
                      <h4 className="font-sans font-black text-sm text-[#002F6C] truncate tracking-tight leading-snug">
                        {revealedStickers[currentIndex].name}
                      </h4>
                      <p className="text-[9px] font-serif text-gray-500 italic mt-0.5">{revealedStickers[currentIndex].club}</p>
                    </div>

                    <div className="bg-[#fcfbf7] py-1.5 px-2 rounded-lg border border-gray-200 text-center font-sans font-bold text-[9px] text-[#002F6C]">
                      Click to reveal 600x700 dynamic info specs
                    </div>
                  </div>

                  {/* Right arrow */}
                  <button
                    disabled={currentIndex === revealedStickers.length - 1}
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="p-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-650 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-sm font-bold text-sm"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Progress dots indicating pulled set */}
              <div className="flex space-x-1.5">
                {revealedStickers.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-[#002F6C] w-4" : "bg-gray-300 w-1.5"
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-3 w-full max-w-sm pt-4 border-t border-gray-300 text-center justify-center">
                <button
                  id="btn-claim-pack-pouch"
                  onClick={handleClaimStickers}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black tracking-wide text-xs uppercase font-sans transition cursor-pointer text-center shadow-lg"
                >
                  Claim All 5 Stickers to Pouch!
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
