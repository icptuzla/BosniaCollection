import React, { useState, useRef, useEffect } from "react";
import { X, Zap, Activity } from "lucide-react";
import { Sticker, UserSticker, StickerType } from "../types";
import { Language, PLAYER_TRANSLATIONS } from "../data/translations";
import logoImage from "./zmajevi logo.webp";

// Solana & Metaplex Umi imports
import { useWallet as useSolanaWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { generateSigner } from "@metaplex-foundation/umi";
import { create } from "@metaplex-foundation/mpl-core";

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

// IPFS config — primary folder plus backup folder CID
const PRIMARY_IPFS_CID = "bafybeigu6pd4t72n7dskbn5wpk5pphf2566xixx5fugw3xhc3cyt44tumy";
const BACKUP_IPFS_CID = "bafybeias3nraryezim72augovtpuful6iuriemqux5qrnyw5gl3buh5aua";
const PRIMARY_IPFS_BASE = `https://${PRIMARY_IPFS_CID}.ipfs.dweb.link/components`;
const BACKUP_IPFS_BASE = `https://${BACKUP_IPFS_CID}.ipfs.dweb.link/components`;
const DEDIC_IPFS_URL = "https://QmXnbHGb7EuvQ4SupEp6ncU6WHLtfnNZquDTnyhGmoDQyn.ipfs.dweb.link";
const IPFS_TIMEOUT_MS = 100_000;

// Local fallback map (Vite bundled imports)
const LOCAL_IMAGE_MAP: Record<string, string> = {
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
  "GoldenCrest.webp": goldenCrestImg,
  "stadionzenica.webp": stadionImg,
  "2014.webp": cohort2014Img,
  "bhfanaticos.webp": bhfImg,
};

// Session-level IPFS reachability cache
let _ipfsReachable: boolean | null = null;
let _ipfsPromise: Promise<boolean> | null = null;
function getIpfsStatus(): Promise<boolean> {
  if (_ipfsReachable !== null) return Promise.resolve(_ipfsReachable);
  if (_ipfsPromise) return _ipfsPromise;
  _ipfsPromise = new Promise<boolean>((resolve) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => { ctrl.abort(); _ipfsReachable = false; resolve(false); }, IPFS_TIMEOUT_MS);
    fetch(`${PRIMARY_IPFS_BASE}/special_collection/GoldenCrest.webp`, { method: "HEAD", signal: ctrl.signal, cache: "no-store" })
      .then(() => { clearTimeout(timer); _ipfsReachable = true; resolve(true); })
      .catch(() => { clearTimeout(timer); _ipfsReachable = false; resolve(false); });
  });
  return _ipfsPromise;
}

// Files that actually live in the special_collection/ IPFS folder.
// NOTE: a sticker can have StickerType.SPECIAL for display/rarity purposes
// while its image is still in the players/ folder (e.g. Muharemović, Alajbegović).
const SPECIAL_COLLECTION_FILES = new Set([
  "GoldenCrest.webp",
  "GoldenCrest.png",
  "stadionzenica.webp",
  "2014.webp",
  "bhfanaticos.webp",
]);

function getIpfsFolder(imageFile: string): string {
  return SPECIAL_COLLECTION_FILES.has(imageFile) ? "special_collection" : "players";
}

function buildIpfsUrl(folder: string, fileName: string): string {
  return `${PRIMARY_IPFS_BASE}/${folder}/${fileName}`;
}

function buildBackupIpfsUrl(folder: string, fileName: string): string {
  return `${BACKUP_IPFS_BASE}/${folder}/${fileName}`;
}

function getPlayerImage(sticker: Sticker, ipfsOk: boolean): string | null {
  if (!sticker.imageFile) return null;
  if (!ipfsOk) return LOCAL_IMAGE_MAP[sticker.imageFile] ?? null;
  if (sticker.imageFile === "Pi_dedic.webp") return DEDIC_IPFS_URL;
  const folder = getIpfsFolder(sticker.imageFile);
  let fileName = sticker.imageFile;
  if (fileName === "GoldenCrest.webp") fileName = "GoldenCrest.png";
  return buildIpfsUrl(folder, fileName);
}

interface CardDetailProps {
  sticker: Sticker;
  userSticker?: UserSticker;
  onClose: () => void;
  onPaste?: (id: number) => void;
  walletConnected: boolean;
  lang: Language;
  mintedStickers: number[];
  onMintSticker: (id: number) => void;
  sandboxMode: boolean;
}

export default function CardDetail({ sticker, userSticker, onClose, onPaste, walletConnected, lang, mintedStickers, onMintSticker, sandboxMode }: CardDetailProps) {
  const [foilStyle, setFoilStyle] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  const [scale, setScale] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [ipfsOk, setIpfsOk] = useState<boolean>(true); // optimistic default

  const [isMinting, setIsMinting] = useState(false);
  const solanaWallet = useSolanaWallet();
  const { connection } = useConnection();

  // Probe IPFS on mount; fallback to local if unreachable in 100s
  useEffect(() => {
    getIpfsStatus().then(ok => setIpfsOk(ok));
  }, []);

  const umi = React.useMemo(() => {
    const u = createUmi(connection.rpcEndpoint);
    if (solanaWallet.wallet) {
      try {
        u.use(walletAdapterIdentity(solanaWallet));
      } catch (e) {
        console.warn("Wallet adapter not initialized:", e);
      }
    }
    return u;
  }, [connection, solanaWallet]);

  const isMinted = mintedStickers.includes(sticker.id);

  // Compute IPFS URI for this card — use filename-based folder, NOT sticker type
  const cardFileName = sticker.imageFile === "GoldenCrest.webp" ? "GoldenCrest.png" : sticker.imageFile;
  const cardFolder = getIpfsFolder(cardFileName);
  const cardIpfsUrl = sticker.imageFile === "Pi_dedic.webp"
    ? DEDIC_IPFS_URL
    : (ipfsOk ? buildIpfsUrl(cardFolder, cardFileName) : buildBackupIpfsUrl(cardFolder, cardFileName));
  const cardIpfsLabel = sticker.imageFile === "Pi_dedic.webp"
    ? "QmXnbHGb7EuvQ4SupEp6ncU6WHLtfnNZquDTnyhGmoDQyn"
    : `${(ipfsOk ? PRIMARY_IPFS_CID : BACKUP_IPFS_CID)}/components/${cardFolder}/${cardFileName}`;

  const handleMintSticker = async () => {
    if (!walletConnected || (!sandboxMode && !solanaWallet.publicKey)) {
      alert(lang === "BS" ? "Povežite novčanik!" : "Please connect your wallet!");
      return;
    }
    setIsMinting(true);
    try {
      if (sandboxMode) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        onMintSticker(sticker.id);
        alert(lang === "BS" ? "Uspješno! (Sandbox simulacija)" : "Success! (Sandbox simulation)");
      } else {
        // Always use IPFS URI for on-chain metadata
        const assetSigner = generateSigner(umi);
        await create(umi, {
          asset: assetSigner,
          name: `BiH WC26 — ${sticker.name}`,
          uri: cardIpfsUrl,
        }).sendAndConfirm(umi);
        onMintSticker(sticker.id);
        alert(lang === "BS" ? "Uspješno! Sličica je spremljena u Vaš novčanik." : "Success! Card minted to your wallet.");
      }
    } catch (e: any) {
      console.error("Minting error:", e);
      alert((lang === "BS" ? "Greška prilikom mintanja: " : "Mint failed: ") + (e.message || e.toString()));
    } finally {
      setIsMinting(false);
    }
  };

  // Dynamically scale card and controls to fit small smartphone screens perfectly
  useEffect(() => {
    const handleResize = () => {
      const padding = 20;
      const cardW = 600;
      const cardH = 750;

      const scaleW = (window.innerWidth - padding) / cardW;
      const scaleH = (window.innerHeight - padding) / cardH;

      setScale(Math.min(1, Math.min(scaleW, scaleH)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate holographic tilt effects on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || flipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates from -15 to +15 deg
    const rotateY = ((x / rect.width) - 0.5) * 22;
    const rotateX = (((y / rect.height) - 0.5) * -22);

    // Normalized shine percentages
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setFoilStyle({ rotateX, rotateY, shineX, shineY });
  };

  const handleMouseLeave = () => {
    setFoilStyle({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid flipping if they clicked on standard paste interactive action button
    const target = e.target as HTMLElement;
    if (target.closest("#btn-paste-sticker-action") || target.closest("#btn-close-card-modal")) {
      return;
    }
    // Flip card between front and back
    setFlipped(!flipped);

    // Synthesize quick flip swoop
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(flipped ? 350 : 250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(flipped ? 150 : 450, audioCtx.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (_) { }
  };

  // Play audio synthesize effect when viewing
  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (_) { }
  }, [sticker.id]);

  const hasStickerPouch = userSticker && userSticker.count > 0;
  const isPasted = userSticker && userSticker.pasted;
  const playerImg = getPlayerImage(sticker, ipfsOk);

  // Localized sticker biography
  const bio = PLAYER_TRANSLATIONS[sticker.id]?.biography[lang] || sticker.biography;

  return (
    <div id="card-detail-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden select-none">

      {/* Viewport Floating Close Button */}
      <button
        id="btn-close-card-modal-viewport"
        onClick={onClose}
        className="fixed top-4 right-4 p-3.5 rounded-full bg-[#002F6C] hover:bg-[#FFCD00] text-white hover:text-[#002F6C] transition-all duration-250 cursor-pointer z-[60] border-2 border-white/80 shadow-[0_0_15px_rgba(255,205,0,0.55)] flex items-center justify-center scale-100 md:scale-110 active:scale-90"
        title="Close Detail"
      >
        <X className="h-6 w-6 stroke-[3px]" />
      </button>

      {/* Dynamic Scaling Wrapper to enforce exact 600px x 700px specs within mobile viewports */}
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        className="relative flex flex-col items-center justify-center transition-transform"
      >

        {/* Floating instructions ribbon */}
        <p className="absolute -top-8 text-white/80 text-xs font-sans tracking-widest uppercase font-bold items-center space-x-1 flex">
          <Zap className="h-3.5 w-3.5 text-[#FFCD00] animate-pulse" />
          <span>{lang === "BS" ? "Kliknite za detalje / Okrenite sličicu" : "Click card to reveal stats / Flip details"}</span>
        </p>

        {/* 3D Scene Wrapper */}
        <div
          onClick={handleCardClick}
          className="relative w-[600px] h-[700px] cursor-pointer animate-fade-in"
          style={{ perspective: "1500px" }}
        >
          {/* Card Container holding both faces */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              transform: flipped
                ? "rotateY(180deg)"
                : `perspective(1000px) rotateX(${foilStyle.rotateX}deg) rotateY(${foilStyle.rotateY}deg)`,
              transition: flipped ? "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "transform 0.1s ease-out",
            }}
            className="relative rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.7)] border-4 border-[#00f0ff]"
          >

            {/* ======================================================== */}
            {/* FRONT FACE (Full WebP Graphic Image is the Background)   */}
            {/* ======================================================== */}
            <div
              style={{
                backgroundImage: playerImg ? `url(${playerImg})` : undefined,
                backgroundSize: sticker.type === StickerType.SPECIAL ? "contain" : "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
              }}
              className={`absolute inset-0 flex flex-col justify-end p-6 rounded-[22px] overflow-hidden transition-all duration-300 ${!playerImg ? "bg-gradient-to-br from-[#002f6c] via-[#091e3b] to-[#011026]" : "bg-white"
                } ${flipped ? "opacity-0 pointer-events-none z-0" : "opacity-100 z-10"}`}
            >
              {/* Micro hologram fiber pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

              {/* Holographic Refraction Overlay */}
              <div
                style={{
                  background: `radial-gradient(circle at ${foilStyle.shineX}% ${foilStyle.shineY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%), linear-gradient(${foilStyle.rotateY * 4.5}deg, rgba(255,205,0,0.08) 0%, rgba(0,47,108,0.05) 50%, rgba(255,255,255,0.06) 100%)`,
                }}
                className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
              />

              {!playerImg && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 text-white space-y-4">
                  <div className="w-32 h-32 bg-slate-950/40 border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                    {sticker.id === 27 ? (
                      <img src={logoImage} alt="Grb Saveza" className="w-24 h-24 object-contain filter drop-shadow-[0_0_8px_rgba(255,205,0,0.85)]" />
                    ) : (
                      <span className="text-6xl">⚽</span>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-widest text-[#FFCD00] font-black">{lang === "BS" ? "Nedostaje grafička datoteka" : "No Graphic Load File"}</p>
                </div>
              )}

              {/* Premium bottom slate containing Name, Club & Position in Comic Sans (bold title, regular text) */}
              <div className="p-4 bg-[#002F6C]/95 border-2 border-[#00f0ff]/80 backdrop-blur-md rounded-2xl text-center shadow-2xl relative z-20 font-sans border-t-4 border-t-[#FFCD00]">
                <h2 className="font-bold text-2xl text-[#FFCD00] truncate leading-none uppercase tracking-wide">
                  {sticker.name}
                </h2>
                <p className="text-sm text-white font-medium block mt-1.5 uppercase tracking-widest opacity-95">
                  {lang === "BS" ? sticker.roleBS : sticker.role} — {sticker.club}
                </p>
                <div className="h-0.5 w-16 bg-[#FFCD00] mx-auto mt-2 opacity-80" />
                <span className="text-[10px] text-gray-300 block mt-1.5 uppercase font-bold tracking-widest">
                  {lang === "BS" ? "Kliknite na karticu za biografiju i statistiku" : "Click Card to Inspect Stats & Biography"}
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* BACK FACE (Stats, Biography, Contract Ledger Details)   */}
            {/* ======================================================== */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg) translateZ(1px)",
                transformStyle: "preserve-3d",
              }}
              className={`absolute inset-0 flex flex-col justify-between p-7 bg-gradient-to-br from-[#021f47] via-[#0b1b30] to-[#010914] text-white flex-shrink-0 rounded-[22px] overflow-hidden transition-all duration-300 antialiased ${flipped ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                }`}
            >
              {/* micro grid back pattern */}
              <div className="absolute inset-0 bg-[#002F6C]/5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-10" />

              {/* Back Header */}
              <div className="flex justify-between items-start border-b border-[#00f0ff]/30 pb-3.5 z-20 font-sans">
                <div className="flex items-center space-x-3.5 text-left">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                    <img src={logoImage} alt="BIH FA Crest" className="h-[2.125rem] w-[2.125rem] object-contain" />
                  </div>
                  <div>
                    <span className="text-[11px] tracking-[0.18em] text-[#FFCD00] font-extrabold uppercase block leading-none">{lang === "BS" ? "SPECIFIKACIJA KOLEKCIONARA" : "COLLECTOR SPEC SHEET"}</span>
                    <h2 className="font-bold text-xl text-white mb-0.5 mt-1.5 truncate uppercase leading-tight">
                      {sticker.name}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-gray-300 block uppercase leading-none">MINT ID:</span>
                  <span className="text-[#00f0ff] font-mono text-sm font-black tracking-wider block mt-1">#BIH-WC26-{sticker.id.toString().padStart(3, "0")}</span>
                  <a href={cardIpfsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[8px] font-mono text-[#14F195]/70 hover:text-[#14F195] block mt-0.5 truncate max-w-[160px] transition"
                    title={`IPFS: ${cardIpfsLabel}`}>
                    ⛓ {cardIpfsLabel.slice(0, 22)}…
                  </a>
                </div>
              </div>

              {/* Biography Section */}
              <div className="bg-white/10 border border-white/20 p-5 rounded-2xl text-left z-20 space-y-3 shadow-inner">
                <h4 className="text-xs uppercase text-[#FFCD00] font-black tracking-widest flex items-center space-x-2 font-sans">
                  <Activity className="h-[1.125rem] w-[1.125rem] text-[#00f0ff]" />
                  <span>{lang === "BS" ? "BIOGRAFIJA I HISTORIJSKE CRTICE" : "BIOGRAPHY & CAREER HISTORIC NOTES"}</span>
                </h4>
                <p className="text-[13.5px] text-white leading-relaxed font-sans font-medium pr-2 antialiased">
                  "{bio}"
                </p>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/15 text-[13px] font-sans text-gray-200 font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#FFCD00]">{lang === "BS" ? "Datum rođenja:" : "Date of Birth:"}</span>
                    <span className="text-white font-black">{sticker.birthDate}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#FFCD00]">{lang === "BS" ? "Visina:" : "Height:"}</span>
                    <span className="text-white font-black">{sticker.height}</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-left z-20">
                <h3 className="text-xs uppercase tracking-widest text-[#FFCD00] font-black mb-4 font-sans">
                  {lang === "BS" ? "STVARNA FUDBALSKA STATISTIKA" : "REAL-WORLD GAME PERFORMANCE METRICS"}
                </h3>

                {sticker.stats ? (
                  <div className="grid grid-cols-3 gap-y-4 gap-x-6 font-sans">
                    {[
                      { label: lang === "BS" ? "PAC (Brzina)" : "PAC (Pace)", val: sticker.stats.pace, color: "bg-[#00f0ff]" },
                      { label: lang === "BS" ? "SHO (Udarac)" : "SHO (Shooting)", val: sticker.stats.shooting, color: "bg-[#FFCD00]" },
                      { label: lang === "BS" ? "PAS (Pasovi)" : "PAS (Passing)", val: sticker.stats.passing, color: "bg-emerald-400" },
                      { label: lang === "BS" ? "DRI (Dribling)" : "DRI (Dribbling)", val: sticker.stats.dribbling, color: "bg-purple-400" },
                      { label: lang === "BS" ? "DEF (Odbrana)" : "DEF (Defending)", val: sticker.stats.defending, color: "bg-rose-400" },
                      { label: lang === "BS" ? "PHY (Fizika)" : "PHY (Physical)", val: sticker.stats.physicality, color: "bg-orange-400" }
                    ].map((s) => (
                      <div key={s.label} className="text-left">
                        <div className="flex justify-between items-center text-[11.5px] text-gray-100 font-extrabold mb-1">
                          <span className="truncate max-w-[85px] tracking-wide">{s.label}</span>
                          <span className="text-white font-black">{s.val}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950/70 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2.5 text-center text-[13px] font-medium text-gray-100 italic leading-relaxed">
                    {lang === "BS"
                      ? "★ Ovaj specijalni kolekcionarski predmet posjeduje posebnu istorijsku težinu. Njegova vrijednost u igri bazira se na unikatnosti i rijetkosti na web3 Solana tržištu sličica!"
                      : "★ This special collectible is high-level historical memorabilia. Its valuation is fueled purely by physical rarity, scarcity index, and web3 Solana trading market volume!"}
                  </div>
                )}
              </div>

              {/* Back Footer Bar / Actions */}
              <div className="z-20 flex justify-between items-center border-t border-white/20 pt-4 text-left font-sans">
                <div>
                  <p className="text-[8.5px] font-bold text-[#FFCD00] uppercase tracking-widest leading-none mb-1">{lang === "BS" ? "SOLANA PAMETNI UGOVOR" : "SOLANA METAPLEX CONTRACT"}</p>
                  <p className="text-xs text-[#14F195] font-bold flex items-center leading-none">
                    <span>{lang === "BS" ? "✓ Sertifikat Verifikovan" : "✓ Metaplex Certificate Verified"}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3.5">
                  {(hasStickerPouch || isPasted) && (
                    isMinted ? (
                      <span className="py-2 px-[1.125rem] rounded-xl bg-emerald-950/40 text-[#14F195] border border-[#14F195]/40 text-xs font-bold uppercase tracking-wider leading-none shrink-0">
                        {lang === "BS" ? "✓ Mintano" : "✓ Minted"}
                      </span>
                    ) : (
                      <button
                        id="btn-mint-sticker-action"
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid card flip
                          handleMintSticker();
                        }}
                        disabled={isMinting}
                        className={`py-2 px-4 rounded-xl font-sans font-black text-xs uppercase tracking-wider transition shrink-0 cursor-pointer ${
                          isMinting
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-[#002F6C] hover:bg-[#FFCD00] text-white hover:text-[#002F6C] border border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.35)]"
                        }`}
                      >
                        {isMinting ? (lang === "BS" ? "Mintanje..." : "Minting...") : (lang === "BS" ? "Mintaj NFT" : "Mint NFT")}
                      </button>
                    )
                  )}

                  {hasStickerPouch && !isPasted && onPaste && (
                    <button
                      id="btn-paste-sticker-action"
                      onClick={() => onPaste(sticker.id)}
                      className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#14F195] to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(20,241,149,0.55)] shrink-0 cursor-pointer"
                    >
                      {lang === "BS" ? "Zalijepi u Album!" : "Paste in Album!"}
                    </button>
                  )}
                  {isPasted ? (
                    <span className="py-2 px-[1.125rem] rounded-xl bg-white/10 text-gray-300 border border-white/20 text-xs font-bold uppercase tracking-wider leading-none">
                      {lang === "BS" ? "✓ Zalijepljeno" : "✓ Pasted"}
                    </span>
                  ) : !hasStickerPouch ? (
                    <div className="text-right text-xs font-bold text-rose-400 font-sans uppercase tracking-widest leading-none">
                      <span>{lang === "BS" ? "Kesica prazna" : "Pouch empty"}</span>
                    </div>
                  ) : null}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Tip Tagline below card */}
        <p className="mt-4 text-[10.5px] font-sans font-bold text-white/70 tracking-wider flex items-center space-x-1 justify-center bg-slate-900/40 py-1.5 px-4 rounded-full border border-white/10">
          <span>{lang === "BS" ? "* Kliknite bilo gdje na karticu da okrenete. Prevucite kursor za nagib ili 3D efekat." : "* Click anywhere on card to Flip. Drag cursor over to tilt."}</span>
        </p>

      </div>
    </div>
  );
}
