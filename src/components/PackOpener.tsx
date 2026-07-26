import React, { useState } from "react";
import { Sparkles, ShoppingBag, Coins, Star } from "lucide-react";
import { Sticker, WalletState, StickerType } from "../types";
import { STICKERS } from "../data/players";
import logoImage from "./zmajevi logo.webp";
import { Language, UI_TRANSLATIONS, PLAYER_TRANSLATIONS } from "../data/translations";

// Solana & Metaplex Umi imports
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { transactionBuilder, publicKey, sol } from "@metaplex-foundation/umi";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";

// Import all uploaded player photos in WebP format
import dzekoImg from "./players/Pi_dzeko.webp";
import demirovicImg from "./players/Pi_Demirovic.webp";
import dedicImg from "./players/Pi_dedic.webp";
import tahirovicImg from "./players/benjamin-tahirovic.webp";
import burnicImg from "./players/denis-burnic.webp";
import memicImg from "./players/amer-memic.webp";
import hadziahmetovicImg from "./players/amir-hadziahmetovic.webp";
import alajbegovicImg from "./players/kenan-alajbegovic.webp";
import bazdarImg from "./players/samed-bazdar.webp";
import radeljicImg from "./players/stjepan-radeljic.webp";
import gigovicImg from "./players/Gigovic.webp";
import muharemovicImg from "./players/muharemovic.webp";
import basicImg from "./players/ivan-basic.webp";
import amirImg from "./players/amir-hadziahmetovic.webp";
import mujakicImg from "./players/mujakic.webp";

import vasiljImg from "./players/nikola-vasilj.webp";
import kolasinacImg from "./players/sead-kolasinac.webp";
import katicImg from "./players/nikola-katic.webp";
import hadzikadunicImg from "./players/hadzikadunic.webp";
import zlomislicImg from "./players/zlomislic.webp";
import bajraktarevicImg from "./players/esmir-bajraktarevic.webp";
import tabakovicImg from "./players/haris.tabakovicpng.webp";
import malicImg from "./players/malic.webp";
import sunjicImg from "./players/sunjic.webp";
import husejinbasicImg from "./players/husejinbasic.webp";
import mahmicImg from "./players/mahmic.webp";
import lukicImg from "./players/lukic.webp";

// Special Collection imports
import grbImg from "./special_collection/grb.png";
import stadionImg from "./special_collection/stadionzenica.webp";
import cohort2014Img from "./special_collection/2014.webp";
import bhfImg from "./special_collection/bhfanaticos.webp";

const playerImageMap: Record<string, string> = {
  "Pi_dzeko.webp": dzekoImg,
  "Pi_Demirovic.webp": demirovicImg,
  "Pi_dedic.webp": dedicImg,
  "benjamin-tahirovic.webp": tahirovicImg,
  "denis-burnic.webp": burnicImg,
  "amer-memic.webp": memicImg,
  "amir-hadziahmetovic.webp": hadziahmetovicImg,
  "kenan-alajbegovic.webp": alajbegovicImg,
  "samed-bazdar.webp": bazdarImg,
  "stjepan-radeljic.webp": radeljicImg,
  "Gigovic.webp": gigovicImg,
  "Muharemovic.webp": muharemovicImg,
  "ivan-basic.webp": basicImg,
  "mujakic.webp": mujakicImg,
  "nikola-vasilj.webp": vasiljImg,
  "sead-kolasinac.webp": kolasinacImg,
  "nikola-katic.webp": katicImg,
  "hadzikadunic.webp": hadzikadunicImg,
  "zlomislic.webp": zlomislicImg,
  "esmir-bajraktarevic.webp": bajraktarevicImg,
  "haris.tabakovicpng.webp": tabakovicImg,
  "malic.webp": malicImg,
  "sunjic.webp": sunjicImg,
  "husejinbasic.webp": husejinbasicImg,
  "mahmic.webp": mahmicImg,
  "lukic.webp": lukicImg,

  // Special collection
  "grb.png": grbImg,
  "stadionzenica.webp": stadionImg,
  "2014.webp": cohort2014Img,
  "bhfanaticos.webp": bhfImg,
};

const getPlayerImage = (sticker: Sticker) => {
  if (sticker.imageFile && playerImageMap[sticker.imageFile]) {
    return playerImageMap[sticker.imageFile];
  }
  return null;
};

interface PackOpenerProps {
  wallet: WalletState;
  onWalletChange: (newWallet: WalletState) => void;
  onAddStickers: (ids: number[]) => void;
  onViewSticker: (sticker: Sticker) => void;
  lang: Language;
}

export default function PackOpener({ wallet, onWalletChange, onAddStickers, onViewSticker, lang }: PackOpenerProps) {
  const [isBought, setIsBought] = useState(false);
  const [packStatus, setPackStatus] = useState<"ready" | "tearing" | "opened">("ready");
  const [revealedStickers, setRevealedStickers] = useState<Sticker[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const packCost = 0.1; // cost in SOL
  const t = UI_TRANSLATIONS[lang];

  // Solana connection and Umi setup
  const solanaWallet = useSolanaWallet();
  const { connection } = useConnection();
  const umi = createUmi(connection.rpcEndpoint)
    .use(walletAdapterIdentity(solanaWallet));

  const handlePurchasePack = async () => {
    if (!wallet.connected) {
      alert(lang === "BS"
        ? "Prvo povežite Vaš Solflare ili Sandbox novčanik kako biste kupili paketić!"
        : "Please connect your Solflare or Sandbox Wallet first to buy a packet!");
      return;
    }
    if (wallet.balance < packCost) {
      alert(lang === "BS"
        ? "Nedovoljno stanje! Zatražite besplatni faucet SOL na kartici novčanika."
        : "Insufficient Balance! Claim free faucet SOL in the wallet card first.");
      return;
    }

    if (wallet.isSimulated) {
      // Sandbox simulated mode
      onWalletChange({
        ...wallet,
        balance: Number((wallet.balance - packCost).toFixed(2)),
      });
    } else {
      // Real Devnet Transaction using Solana Wallet
      setIsProcessing(true);
      try {
        if (!wallet.publicKey) {
          throw new Error(lang === "BS" ? "Nema javnog ključa novčanika!" : "No wallet public key found!");
        }

        // Build transfer transaction sending 0.1 SOL back to the user's own address (Self-Transfer)
        const tx = transactionBuilder().add(transferSol(umi, {
          source: umi.identity,
          destination: publicKey(wallet.publicKey),
          amount: sol(packCost)
        }));

        const result = await tx.sendAndConfirm(umi);
        console.log("Pack purchase transfer successful. Tx:", result.signature);

        // Manually decrement the state balance locally so it changes immediately visually
        onWalletChange({
          ...wallet,
          balance: Number((wallet.balance - packCost).toFixed(4)),
        });
      } catch (err: any) {
        console.error("Pack purchase transaction failed:", err);
        alert(lang === "BS"
          ? "Greška prilikom transakcije: " + (err.message || err.toString())
          : "Transaction failed: " + (err.message || err.toString()));
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
    }

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
    } catch (_) { }

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
    } catch (_) { }

    // Pull 5 stickers (approx. 1 high rating/special, 4 standard)
    setTimeout(() => {
      const pulled: Sticker[] = [];
      const totalCount = STICKERS.length;

      for (let i = 0; i < 5; i++) {
        let rolled: Sticker;

        // Ensure some cool distribution
        if (i === 4) {
          // Guaranteed special or top player (>80 rating) roll
          const excitingList = STICKERS.filter(s => s.id >= 25 || (s.stats && s.stats.overall >= 80));
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
    } catch (_) { }

    // Reset loop
    setIsBought(false);
    setPackStatus("ready");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-5 md:p-8 bg-surface border border-border rounded-2xl text-text">
      <div className="text-center font-sans animate-fade-in">
        <h2 className="text-2xl font-black text-text uppercase tracking-tighter leading-none">
          {t.boosterShopTitle}
        </h2>
        <p className="text-xs font-sans text-text-muted mt-2">
          {t.boosterShopDesc}
        </p>
      </div>

      {!isBought ? (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4 w-full">
          {/* Visual Foil Packet placeholder */}
          <div className="relative w-56 h-72 rounded-2xl bg-gradient-to-br from-surface-2 to-base border-2 border-gold/40 flex flex-col justify-between p-4 flex-shrink-0 animate-bounce-slow text-white select-none">
            {/* Crinkled Foil texture borders */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gold flex items-center justify-center space-x-1 font-sans text-[11px] text-base font-black overflow-hidden tracking-widest leading-none">
              <span>★ BOSNA ★ ZMAJEVI ★ BIH ★</span>
            </div>

            <div className="my-auto text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-base/40 border border-border flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-gold" />
              </div>
              <div className="font-sans">
                <span className="text-[11px] font-bold tracking-wider text-text-muted uppercase block leading-none"> STYLE</span>
                <h3 className="font-black text-xl tracking-tight text-text uppercase leading-none mt-1.5">
                  WC2026 Booster
                </h3>
              </div>
            </div>

            <div className="bg-base/50 py-1.5 px-2 rounded-lg border border-border text-center font-mono text-[11px] text-gold font-black">
              {lang === "BS" ? "5 VRHUNSKIH SLIČICA" : "5 PREMIUM STICKERS"}
            </div>

            <div className="absolute bottom-0 inset-x-0 h-4 bg-gold" />
          </div>

          <div className="space-y-4 max-w-sm text-center md:text-left font-sans">
            <h3 className="font-black text-xl text-text uppercase tracking-tight">
              {lang === "BS" ? "Kupi Sličice Zmajeva" : "Purchase Zmajevi Pack"}
            </h3>
            <p className="text-text-muted text-xs font-sans leading-relaxed">
              {lang === "BS"
                ? "Svaki paketić se sastoji od 5 nasumičnih sličica koje uključuju 22 standardna igrača i 4 specijalna zlatna hologramska elementa iznenađenja."
                : "Each packet consists of 5 random items including 22 standard players and 4 special golden holographic elements of surprise."}
            </p>

            <div className="bg-surface-2 border border-border p-4 rounded-xl flex items-center justify-between text-text">
              <div className="text-left">
                <span className="text-[11px] font-sans font-bold text-text-muted block uppercase font-sans leading-none">{lang === "BS" ? "CIJENA PAKETIĆA:" : "PRICE PER PACKET:"}</span>
                <span className="text-lg font-sans font-black text-gold flex items-center space-x-1 mt-1">
                  <Coins className="h-4.5 w-4.5 text-gold mr-1" />
                  <span>{packCost} SOL</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-sans font-bold text-text-muted block uppercase font-sans leading-none">{t.yourBalance}</span>
                <span className="text-xs font-mono font-bold text-text-muted mt-1 block">
                  {wallet.connected ? `${wallet.balance.toFixed(2)} SOL` : "Not Connected"}
                </span>
              </div>
            </div>

            <button
              id="btn-buy-booster-packet"
              onClick={handlePurchasePack}
              disabled={isProcessing}
              className={`w-full flex items-center justify-center space-x-1.5 py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-sans font-bold text-xs uppercase tracking-wider transition cursor-pointer ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {isProcessing
                  ? (lang === "BS" ? "PROCESIRANJE..." : "PROCESSING...")
                  : (lang === "BS" ? `Kupi paketić za ${packCost} SOL` : `Purchase Pack for ${packCost} SOL`)}
              </span>
            </button>

            {!wallet.connected && (
              <p className="text-[11px] font-sans font-bold text-danger text-center">
                {lang === "BS" ? "* Molimo Vas da prvo povežete novčanik iznad!" : "* Please connect Solflare or Sandbox wallet above!"}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Ripping envelope / Revealing stickers */
        <div className="w-full py-4 flex flex-col items-center">
          {packStatus === "ready" && (
            <div className="flex flex-col items-center space-y-6">
              <p className="text-xs font-sans text-gold font-bold text-center">
                {lang === "BS" ? "✓ Sredstva osigurana. Paket je spreman za otvaranje!" : "✓ Pack secured on Solana devnet! Ready to open."}
              </p>

              {/* Interaction - Tear top of foil pack */}
              <div
                id="interactive-tear-envelope"
                onClick={handleRipPack}
                className="group relative w-60 h-80 rounded-2xl bg-gradient-to-br from-surface-2 to-base border-2 border-gold/40 flex flex-col justify-center items-center p-4 cursor-pointer hover:border-gold transition shrink-0 text-white"
              >
                <div className="absolute top-0 inset-x-0 h-8 bg-gold group-hover:bg-gold-hover transition flex items-center justify-center overflow-hidden border-b-2 border-dashed border-base">
                  <span className="font-sans text-[11px] text-base font-black tracking-widest leading-none">
                    {t.ripPackLabel}
                  </span>
                </div>

                <div className="text-center space-y-2">
                  <Sparkles className="h-10 w-10 text-gold mx-auto" />
                  <p className="text-xl font-sans font-black uppercase tracking-tight text-gold leading-none">
                    {t.ripMe}
                  </p>
                  <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-text-muted px-2 leading-tight">
                    {t.envelopeDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {packStatus === "tearing" && (
            <div className="flex flex-col items-center py-20 space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-text-muted font-sans text-sm text-center">
                {lang === "BS" ? "Otvaranje metaliziranog paketića..." : "Ripping foil envelope & loading entropy..."}
              </p>
            </div>
          )}

          {packStatus === "opened" && (
            <div className="space-y-6 w-full flex flex-col items-center">

              {/* Stack / Viewer Carousel of Pulled Stickers */}
              <div className="flex flex-col items-center space-y-4 w-full text-text">
                <div className="text-[11px] sm:text-xs font-sans font-bold tracking-wider text-primary uppercase bg-primary/15 border border-primary/30 py-1.5 px-3 rounded text-center">
                  {lang === "BS" ? "Izvučena sličica BROJ " : "Pulled sticker CARD "} {currentIndex + 1} {t.ofLabel} {revealedStickers.length}
                </div>

                <div className="flex items-center space-x-4 sm:space-x-6 justify-center w-full">
                  {/* Left arrow */}
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="p-3 bg-surface-2 border border-border rounded-full hover:bg-surface-3 text-text disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer font-bold text-sm"
                  >
                    ←
                  </button>

                  {/* Pack Sticker Display */}
                  <div
                    onClick={() => onViewSticker(revealedStickers[currentIndex])}
                    style={{
                      backgroundImage: getPlayerImage(revealedStickers[currentIndex]) ? `url(${getPlayerImage(revealedStickers[currentIndex])})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "top",
                    }}
                    className={`relative w-56 sm:w-64 h-72 sm:h-80 rounded-2xl border-2 border-gold/40 flex flex-col justify-end cursor-pointer hover:scale-105 transition-all overflow-hidden ${!getPlayerImage(revealedStickers[currentIndex]) ? "bg-gradient-to-br from-surface-2 to-base" : "bg-surface-2"
                      }`}
                  >
                    {/* Shimmer physical sticker overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none z-10" />

                    {/* Default content if no playerImg is loaded */}
                    {!getPlayerImage(revealedStickers[currentIndex]) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                        {revealedStickers[currentIndex].id === 27 ? (
                          <img src={logoImage} alt="Zmajevi Gold Badge" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" referrerPolicy="no-referrer" />
                        ) : revealedStickers[currentIndex].type === StickerType.SPECIAL ? (
                          <Star className="h-12 w-12 sm:h-14 sm:w-14 text-gold" />
                        ) : (
                          <div className="space-y-1">
                            <div className="text-lg sm:text-xl font-sans font-black text-gold tracking-wide">BIH</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Slate Overlay containing name, club & position */}
                    <div className="p-2 sm:p-3 bg-base/95 border-t border-gold/40 text-center relative z-20 font-sans">
                      <h4 className="font-sans font-black text-[11px] sm:text-xs text-gold truncate leading-tight">
                        {revealedStickers[currentIndex].name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-text-muted font-bold block mt-0.5 uppercase tracking-wide truncate">
                        {PLAYER_TRANSLATIONS[revealedStickers[currentIndex].id]?.role[lang] || revealedStickers[currentIndex].role} • {revealedStickers[currentIndex].club}
                      </p>
                    </div>
                  </div>

                  {/* Right arrow */}
                  <button
                    disabled={currentIndex === revealedStickers.length - 1}
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="p-3 bg-surface-2 border border-border rounded-full hover:bg-surface-3 text-text disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer font-bold text-sm"
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
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-primary w-4" : "bg-border w-1.5"
                      }`}
                  />
                ))}
              </div>

              <div className="flex space-x-3 w-full max-w-sm pt-4 border-t border-border text-center justify-center font-sans">
                <button
                  id="btn-claim-pack-pouch"
                  onClick={handleClaimStickers}
                  className="flex-1 py-3 px-6 rounded-xl bg-success hover:bg-success/90 text-base font-black tracking-wide text-xs uppercase transition cursor-pointer text-center"
                >
                  {t.claimAllButton}
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
