import React, { useState } from "react";
import { Sparkles, ShoppingBag, Coins, Star } from "lucide-react";
import { Sticker, WalletState, StickerType } from "../types";
import { STICKERS } from "../data/players";
import logoImage from "./zmajevi logo.webp";
import { Language, UI_TRANSLATIONS, PLAYER_TRANSLATIONS } from "../data/translations";

// Booster pack images
import bagOfStickersImg from "./Bagofstickers.webp";
import boosterPackImg from "./BoosterPack.webp";
import wc2026BoosterImg from "./WC2026_BOOSTER.webp";

// Solana & Metaplex Umi imports
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { transactionBuilder, publicKey, sol, keypairIdentity, generateSigner } from "@metaplex-foundation/umi";
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
import gigovicImg from "./players/gigovic.webp";
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
import goldenCrestImg from "./special_collection/GoldenCrest.webp";
import stadionImg from "./special_collection/stadionzenica.webp";
import cohort2014Img from "./special_collection/2014.webp";
import bhfImg from "./special_collection/bhfanaticos.webp";

const PRIMARY_IPFS_CID = "bafybeigu6pd4t72n7dskbn5wpk5pphf2566xixx5fugw3xhc3cyt44tumy";
const BACKUP_IPFS_CID = "bafybeias3nraryezim72augovtpuful6iuriemqux5qrnyw5gl3buh5aua";
const PRIMARY_IPFS_BASE = `https://${PRIMARY_IPFS_CID}.ipfs.dweb.link/components`;
const BACKUP_IPFS_BASE = `https://${BACKUP_IPFS_CID}.ipfs.dweb.link/components`;
const DEDIC_IPFS_URL = "https://QmXnbHGb7EuvQ4SupEp6ncU6WHLtfnNZquDTnyhGmoDQyn.ipfs.dweb.link";

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
  "gigovic.webp": gigovicImg,
  "muharemovic.webp": muharemovicImg,
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
  "GoldenCrest.webp": goldenCrestImg,
  "stadionzenica.webp": stadionImg,
  "2014.webp": cohort2014Img,
  "bhfanaticos.webp": bhfImg,
};

// Files that live in special_collection/ on IPFS — all others are in players/
const SPECIAL_COLLECTION_FILES = new Set([
  "GoldenCrest.webp", "GoldenCrest.png", "stadionzenica.webp", "2014.webp", "bhfanaticos.webp",
]);

const getPlayerImage = (sticker: Sticker): { ipfs: string; local: string | null } => {
  if (!sticker.imageFile) return { ipfs: "", local: null };
  if (sticker.imageFile === "Pi_dedic.webp") return { ipfs: DEDIC_IPFS_URL, local: dedicImg };
  const folder = SPECIAL_COLLECTION_FILES.has(sticker.imageFile) ? "special_collection" : "players";
  let fileName = sticker.imageFile;
  if (fileName === "GoldenCrest.webp") fileName = "GoldenCrest.png";
  const ipfs = `${BACKUP_IPFS_BASE}/${folder}/${fileName}`;
  const local = playerImageMap[sticker.imageFile] ?? null;
  return { ipfs, local };
};

interface PackOpenerProps {
  wallet: WalletState;
  onWalletChange: (newWallet: WalletState) => void;
  onAddStickers: (ids: number[]) => void;
  onViewSticker: (sticker: Sticker) => void;
  lang: Language;
  sandboxMode?: boolean;
}

export default function PackOpener({ wallet, onWalletChange, onAddStickers, onViewSticker, lang, sandboxMode }: PackOpenerProps) {
  const [isBought, setIsBought] = useState(false);
  const [packStatus, setPackStatus] = useState<"ready" | "tearing" | "opened">("ready");
  const [revealedStickers, setRevealedStickers] = useState<Sticker[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackIdx, setSelectedPackIdx] = useState<number | null>(null);

  const PACK_CONFIGS = [
    {
      id: "bag-of-stickers",
      image: bagOfStickersImg,
      cost: 0.05,
      cardCount: 4,
      titleEN: "Bag of Stickers",
      titleBS: "Vrećica Sličica",
      descEN: "A starter bag with 4 random stickers from the collection.",
      descBS: "Početna vrećica sa 4 nasumične sličice iz kolekcije.",
    },
    {
      id: "booster-pack",
      image: boosterPackImg,
      cost: 0.08,
      cardCount: 5,
      titleEN: "Booster Pack",
      titleBS: "Booster Paketić",
      descEN: "Standard booster with 5 stickers including players and specials.",
      descBS: "Standardni booster sa 5 sličica uključujući igrače i specijalne.",
    },
    {
      id: "wc2026-booster",
      image: wc2026BoosterImg,
      cost: 0.1,
      cardCount: 5,
      titleEN: "World Cup 2026 Premium",
      titleBS: "Svjetsko Prvenstvo 2026 Premium",
      descEN: "Premium pack with 5 cards — guaranteed high-rated or special card!",
      descBS: "Premium paketić sa 5 karata — garantovana visoko ocjenjena ili specijalna karta!",
    },
  ];

  const activePack = selectedPackIdx !== null ? PACK_CONFIGS[selectedPackIdx] : null;
  const packCost = activePack?.cost ?? 0.1;
  const t = UI_TRANSLATIONS[lang];

  // Solana connection and Umi setup
  const solanaWallet = useSolanaWallet();
  const { connection } = useConnection();
  const umi = React.useMemo(() => {
    const u = createUmi(connection.rpcEndpoint);
    if (sandboxMode) {
      try {
        const kp = generateSigner(u);
        u.use(keypairIdentity(kp));
      } catch (e) {
        console.warn("Failed to create sandbox signer for UMI:", e);
      }
    } else if (solanaWallet.wallet) {
      try {
        u.use(walletAdapterIdentity(solanaWallet));
      } catch (e) {
        console.warn("Wallet adapter not initialized:", e);
      }
    }
    return u;
  }, [connection, solanaWallet, sandboxMode]);

  const handlePurchasePack = async (cost: number) => {
    if (!wallet.connected) {
      alert(lang === "BS"
        ? "Prvo povežite Vaš Solflare novčanik kako biste kupili paketić!"
        : "Please connect your Solflare Wallet first to buy a packet!");
      return;
    }
    if (wallet.balance < cost) {
      alert(lang === "BS"
        ? "Nedovoljno stanje! Zatražite besplatni faucet SOL na kartici novčanika."
        : "Insufficient Balance! Claim free faucet SOL in the wallet card first.");
      return;
    }

    // Real Devnet/Mainnet Transaction using Solana Wallet
    setIsProcessing(true);
    try {
      if (!sandboxMode) {
        if (!wallet.publicKey) {
          throw new Error(lang === "BS" ? "Nema javnog ključa novčanika!" : "No wallet public key found!");
        }

        // Build transfer transaction sending SOL to the treasury address
        const tx = transactionBuilder().add(transferSol(umi, {
          source: umi.identity,
          destination: publicKey("DrQQhXb2dk99XvhM1Rem7PnKZDkah6C5aFU9Uyd5ju54"),
          amount: sol(cost)
        }));

        const result = await tx.sendAndConfirm(umi);
        console.log("Pack purchase transfer successful. Tx:", result.signature);
      } else {
        await new Promise(r => setTimeout(r, 600)); // Simulate delay
        console.log("Sandbox mode: Bypassed UMI transaction");
      }

      // Manually decrement the state balance locally so it changes immediately visually
      onWalletChange({
        ...wallet,
        balance: Number((wallet.balance - cost).toFixed(4)),
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

    // Pull stickers based on selected pack card count
    setTimeout(() => {
      const pulled: Sticker[] = [];
      const totalCount = STICKERS.length;
      const pulledIds = new Set<number>();
      const pullCount = activePack?.cardCount ?? 5;
      const isPremium = activePack?.id === "wc2026-booster";

      // For premium WC2026: pool is all players sorted by overall desc, take top 12
      const premiumPool = isPremium
        ? [...STICKERS]
          .filter(s => s.stats?.overall)
          .sort((a, b) => (b.stats?.overall ?? 0) - (a.stats?.overall ?? 0))
          .slice(0, 12)
        : [];

      while (pulled.length < pullCount) {
        let rolled: Sticker;

        if (isPremium) {
          // All cards from premium top-rated pool
          const pool = premiumPool.filter(s => !pulledIds.has(s.id));
          rolled = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)]
            : STICKERS.filter(s => !pulledIds.has(s.id))[0] ?? STICKERS[0];
        } else {
          const isFinalCard = pulled.length === pullCount - 1;
          if (isFinalCard) {
            // Last card guaranteed special or high rating
            const excitingList = STICKERS.filter(s => !pulledIds.has(s.id) && (s.id >= 25 || (s.stats && s.stats.overall >= 80)));
            rolled = excitingList.length > 0
              ? excitingList[Math.floor(Math.random() * excitingList.length)]
              : STICKERS.filter(s => !pulledIds.has(s.id))[0] ?? STICKERS[0];
          } else {
            // Standard random roll
            rolled = STICKERS[Math.floor(Math.random() * totalCount)];
          }
        }

        if (!pulledIds.has(rolled.id)) {
          pulled.push(rolled);
          pulledIds.add(rolled.id);
        }
      }

      setRevealedStickers(pulled);
      setPackStatus("opened");

      // Auto-claim the stickers to the pouch immediately so if they click to view details, it shows they own it!
      if (!hasClaimed) {
        onAddStickers(pulled.map(s => s.id));
        setHasClaimed(true);
      }
    }, 850);
  };

  const handleClaimStickers = () => {
    // Stickers are already added to collection upon rip. This just closes the view.


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
    setSelectedPackIdx(null);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto p-5 md:p-8 bg-white border border-gray-300 rounded-2xl shadow-sm text-gray-800">
      <div className="text-center font-sans animate-fade-in">
        <h2 className="text-2xl font-black text-[#002F6C] uppercase tracking-tighter leading-none">
          {t.boosterShopTitle}
        </h2>
        <p className="text-xs font-serif italic text-gray-500 mt-2">
          {t.boosterShopDesc}
        </p>
      </div>

      {!isBought ? (
        <div className="flex flex-col gap-6 py-4 w-full">
          {PACK_CONFIGS.map((pack, idx) => (
            <div
              key={pack.id}
              className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-br from-[#f8f7f2] to-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#002F6C]/30 transition-all group"
            >
              {/* Pack Image — black background, image displayed as-is */}
              <div className="relative w-44 h-56 sm:w-48 sm:h-60 rounded-xl overflow-hidden border-2 border-[#00f0ff]/40 shadow-[0_0_12px_rgba(0,240,255,0.3)] flex-shrink-0 group-hover:shadow-[0_0_18px_rgba(0,240,255,0.5)] transition-shadow bg-black">
                <img
                  src={pack.image}
                  alt={lang === "BS" ? pack.titleBS : pack.titleEN}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Pack Details & Purchase */}
              <div className="flex-1 space-y-3 text-center sm:text-left font-sans w-full">
                <div>
                  <h3 className="font-black text-lg text-[#002F6C] uppercase tracking-tight leading-tight">
                    {lang === "BS" ? pack.titleBS : pack.titleEN}
                  </h3>
                  <p className="text-gray-500 text-xs font-serif italic leading-relaxed mt-1">
                    {lang === "BS" ? pack.descBS : pack.descEN}
                  </p>
                </div>

                {/* Price & Balance row */}
                <div className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="text-left">
                    <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">
                      {lang === "BS" ? "CIJENA:" : "PRICE:"}
                    </span>
                    <span className="text-lg font-sans font-black text-[#002F6C] flex items-center mt-0.5">
                      <Coins className="h-4 w-4 text-[#FFCD00] mr-1" />
                      <span>{pack.cost} SOL</span>
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">
                      {lang === "BS" ? "SADRŽAJ:" : "CONTAINS:"}
                    </span>
                    <span className="text-sm font-sans font-black text-[#002F6C] mt-0.5 block">
                      {pack.cardCount} {lang === "BS" ? "karata" : "cards"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">{t.yourBalance}</span>
                    <span className="text-xs font-mono font-bold text-[#002F6C] mt-0.5 block">
                      {wallet.connected ? `${wallet.balance.toFixed(2)} SOL` : (lang === "BS" ? "Nije povezan" : "Not Connected")}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  id={`btn-buy-${pack.id}`}
                  onClick={() => {
                    setSelectedPackIdx(idx);
                    handlePurchasePack(pack.cost);
                  }}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center space-x-1.5 py-3 px-6 rounded-xl bg-[#002F6C] hover:bg-[#0c3e80] text-white font-sans font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {isProcessing
                      ? (lang === "BS" ? "PROCESIRANJE..." : "PROCESSING...")
                      : (lang === "BS" ? `Kupi za ${pack.cost} SOL` : `Purchase for ${pack.cost} SOL`)}
                  </span>
                </button>

                {!wallet.connected && (
                  <p className="text-[10px] font-sans font-bold text-rose-500 text-center animate-pulse">
                    {lang === "BS" ? "* Molimo Vas da prvo povežete novčanik!" : "* Please connect Solflare wallet first!"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Ripping envelope / Revealing stickers */
        <div className="w-full py-4 flex flex-col items-center">
          {packStatus === "ready" && (
            <div className="flex flex-col items-center space-y-6">
              <p className="text-xs font-serif text-[#002F6C] font-bold animate-pulse text-center">
                {lang === "BS" ? "✓ Sredstva osigurana. Paket je spreman za otvaranje!" : "✓ Pack secured on Solana devnet! Ready to open."}
              </p>

              {/* Interaction - Show purchased pack image; click to rip */}
              <div
                id="interactive-tear-envelope"
                onClick={handleRipPack}
                className="group relative w-60 h-80 rounded-2xl overflow-hidden border-4 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.65)] cursor-pointer hover:border-[#00e5ff] hover:shadow-[0_0_35px_rgba(0,240,255,0.95)] transition-all bg-black flex items-center justify-center shrink-0"
              >
                {activePack && (
                  <img
                    src={activePack.image}
                    alt={lang === "BS" ? activePack.titleBS : activePack.titleEN}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                )}
                {/* Tap hint overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-2 flex items-center justify-center gap-1.5 border-t border-dashed border-[#00f0ff]/50">
                  <Sparkles className="h-3.5 w-3.5 text-[#FFCD00] animate-pulse" />
                  <span className="font-sans text-[10px] text-white font-black tracking-widest uppercase animate-pulse">
                    {lang === "BS" ? "Klikni da otvoriš!" : "Click to Rip Open!"}
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-[#FFCD00] animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {packStatus === "tearing" && (
            <div className="flex flex-col items-center py-20 space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-[#002F6C] border-t-transparent animate-spin" />
              <p className="text-[#002F6C] font-serif italic text-sm animate-pulse text-center">
                {lang === "BS" ? "Otvaranje metaliziranog paketića..." : "Ripping foil envelope & loading entropy..."}
              </p>
            </div>
          )}

          {packStatus === "opened" && (
            <div className="space-y-6 w-full flex flex-col items-center">

              {/* Stack / Viewer Carousel of Pulled Stickers */}
              <div className="flex flex-col items-center space-y-4 w-full text-gray-800">
                <div className="text-[10px] sm:text-xs font-sans font-bold tracking-wider text-[#002F6C] uppercase bg-[#002F6C]/10 py-1.5 px-3 rounded text-center">
                  {lang === "BS" ? "Izvučena sličica BROJ " : "Pulled sticker CARD "} {currentIndex + 1} {t.ofLabel} {revealedStickers.length}
                </div>

                <div className="flex items-center space-x-4 sm:space-x-6 justify-center w-full">
                  {/* Left arrow */}
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="p-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-650 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-sm font-bold text-sm"
                  >
                    ←
                  </button>

                  {/* Pack Sticker Display — matches album card style */}
                  <div
                    onClick={() => onViewSticker(revealedStickers[currentIndex])}
                    className={`relative w-56 sm:w-64 rounded-2xl border-4 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.6)] flex flex-col text-left cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(0,240,255,0.85)] transition-all overflow-hidden ${
                      !getPlayerImage(revealedStickers[currentIndex]).ipfs && !getPlayerImage(revealedStickers[currentIndex]).local ? "bg-gradient-to-b from-[#124285] to-[#002F6C] aspect-[3/4.2] justify-end" : "bg-white"
                    }`}
                  >
                    {/* If we have an image, show it using an img tag to respect its natural aspect ratio */}
                    {(() => {
                      const { ipfs, local } = getPlayerImage(revealedStickers[currentIndex]);
                      return (ipfs || local) ? (
                        <div className="relative w-full bg-white flex flex-col justify-end">
                          <img
                            src={ipfs}
                            alt={revealedStickers[currentIndex].name}
                            className="w-full h-auto object-contain block"
                            onError={(e) => { if (local) (e.currentTarget as HTMLImageElement).src = local; }}
                          />
                        </div>
                      ) : null;
                    })()}

                    {/* Default emblem placeholder if no player image could be loaded */}
                    {(() => {
                      const { ipfs, local } = getPlayerImage(revealedStickers[currentIndex]);
                      return !ipfs && !local ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10 relative">
                          {revealedStickers[currentIndex].id === 27 ? (
                            <img src={logoImage} alt="Zmajevi Gold Crest" className="h-10 w-10 object-contain filter drop-shadow-[0_0_8px_rgba(255,205,0,0.85)] shrink-0" referrerPolicy="no-referrer" />
                          ) : revealedStickers[currentIndex].type === StickerType.SPECIAL ? (
                            <Star className="h-8 w-8 text-[#FFCD00] drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                          ) : (
                            <span className="text-xl">⚽</span>
                          )}
                        </div>
                      ) : null;
                    })()}

                    {/* Clean bottom ribbon display block style — same as album */}
                    <div className="p-2 bg-[#002F6C]/95 border-t border-[#00f0ff]/50 text-center shadow-md relative z-20 font-sans shrink-0">
                      <h4 className="font-sans font-black text-[10px] sm:text-[10.5px] text-[#FFCD00] truncate leading-tight">
                        {revealedStickers[currentIndex].name}
                      </h4>
                      <p className="text-[8px] sm:text-[8.5px] text-white/95 font-bold block mt-0.5 uppercase tracking-wide truncate">
                        {PLAYER_TRANSLATIONS[revealedStickers[currentIndex].id]?.role[lang] || revealedStickers[currentIndex].role} • {revealedStickers[currentIndex].club}
                      </p>
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
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-[#002F6C] w-4" : "bg-gray-300 w-1.5"
                      }`}
                  />
                ))}
              </div>

              <div className="flex space-x-3 w-full max-w-sm pt-4 border-t border-gray-300 text-center justify-center font-sans">
                <button
                  id="btn-claim-pack-pouch"
                  onClick={handleClaimStickers}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black tracking-wide text-xs uppercase transition cursor-pointer text-center shadow-lg"
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
