import React, { useState } from "react";
import { BookOpen, Star, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { Sticker, StickerType, UserSticker } from "../types";
import { STICKERS } from "../data/players";
import logoImage from "./zmajevi logo.webp";
import albumCoverImg from "./Album.webp";
import { Language, UI_TRANSLATIONS, PLAYER_TRANSLATIONS } from "../data/translations";

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
import gigovicImg from "./players/Gigovic.webp";
import muharemovicImg from "./players/Muharemovic.webp";
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
import rewardGoldenCrestImg from "./special_collection/RewardGoldenCrest.webp";

const PRIMARY_IPFS_CID = "bafybeigu6pd4t72n7dskbn5wpk5pphf2566xixx5fugw3xhc3cyt44tumy";
const BACKUP_IPFS_CID = "bafybeias3nraryezim72augovtpuful6iuriemqux5qrnyw5gl3buh5aua";
const PRIMARY_IPFS_BASE = `https://${PRIMARY_IPFS_CID}.ipfs.dweb.link/components`;
const BACKUP_IPFS_BASE = `https://${BACKUP_IPFS_CID}.ipfs.dweb.link/components`;
const DEDIC_IPFS_URL = "https://QmXnbHGb7EuvQ4SupEp6ncU6WHLtfnNZquDTnyhGmoDQyn.ipfs.dweb.link";
const REWARD_GOLDEN_CREST_URL = "https://bafybeihntowy3cfvf2defm5jiohxxq7lkh6wrrkdr7n5re5yifgvh3upte.ipfs.dweb.link?filename=RewardGoldenCrest.webp";


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
  "GoldenCrest.webp": goldenCrestImg,
  "stadionzenica.webp": stadionImg,
  "2014.webp": cohort2014Img,
  "bhfanaticos.webp": bhfImg,
};

// Files that live in special_collection/ on IPFS — all others are in players/
const SPECIAL_COLLECTION_FILES = new Set([
  "GoldenCrest.webp", "stadionzenica.webp", "2014.webp", "bhfanaticos.webp",
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

interface AlbumPageProps {
  collection: UserSticker[];
  onViewSticker: (sticker: Sticker) => void;
  pastedCount: number;
  lang: Language;
  walletConnected?: boolean;
  hasClaimedReward?: boolean;
  onClaimReward?: () => void;
  sandboxMode: boolean;
}

export default function AlbumPage({ collection, onViewSticker, pastedCount, lang, walletConnected, hasClaimedReward, onClaimReward, sandboxMode }: AlbumPageProps) {
  // - Page 0: Album Cover
  // - Page 1: Starters Part I (Slots 1-6)
  // - Page 2: Starters Part II (Slots 7-11)
  // - Page 3: Substitutions Part I (Slots 12-17)
  // - Page 4: Substitutions Part II (Slots 18-23)
  // - Page 5: Player 24, Separator, Special Collection (Slots 25-28)

  const [currentPage, setCurrentPage] = useState(0);
  const [isMinting, setIsMinting] = useState(false);

  const t = UI_TRANSLATIONS[lang];

  const solanaWallet = useSolanaWallet();
  const { connection } = useConnection();
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

  const handleMintReward = async () => {
    if (!walletConnected || !solanaWallet.publicKey) {
      alert(lang === "BS" ? "Povežite novčanik!" : "Please connect your wallet!");
      return;
    }
    setIsMinting(true);
    try {
      if (sandboxMode) {
        // Simulate Sandbox minting for the Reward
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(lang === "BS" ? "Uspješno! (Sandbox simulacija nagrade)" : "Success! (Sandbox reward simulation)");
        onClaimReward?.();
      } else {
        const assetSigner = generateSigner(umi);
        await create(umi, {
          asset: assetSigner,
          name: "Bosnia WC2026 — Golden Crest",
          uri: REWARD_GOLDEN_CREST_URL,
        }).sendAndConfirm(umi);

        alert(lang === "BS" ? "Uspješno! Provjerite Solflare kolekcionarstvo." : "Success! Check your Solflare collectibles.");
        onClaimReward?.();
      }
    } catch (e: any) {
      console.error(e);
      alert((lang === "BS" ? "Greška prilikom mintanja: " : "Mint failed: ") + (e.message || e.toString()));
    } finally {
      setIsMinting(false);
    }
  };

  const getPageStickers = (pageNum: number): Sticker[] => {
    switch (pageNum) {
      case 1: return STICKERS.slice(0, 6);
      case 2: return STICKERS.slice(6, 11);
      case 3: return STICKERS.slice(11, 17);
      case 4: return STICKERS.slice(17, 23);
      case 5: return STICKERS.slice(23, 29);
      default: return [];
    }
  };

  const handleNextPage = () => {
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPossible = STICKERS.length;
  const progressPercent = Math.round((pastedCount / totalPossible) * 100);

  // Removing setIsAlbumOpen that throws an error
  return (
    <div className="w-full flex flex-col items-center space-y-6">

      {/* Album collection status tracker board */}
      <div className="w-full max-w-4xl bg-white border border-gray-300 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-5 shadow-sm text-gray-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#002F6C]/10 rounded-xl text-[#002F6C]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="text-left font-sans">
            <h3 className="font-bold text-base text-[#002F6C] uppercase tracking-tight">{t.progressionTitle}</h3>
            <p className="text-xs italic text-gray-500">
              {t.pastedCountLabel}: <span className="text-[#002F6C] font-bold">{pastedCount}</span> {t.ofLabel} {totalPossible} {t.spotsLabel}
            </p>
          </div>
        </div>

        {/* Dynamic gauge bar */}
        <div className="flex-1 max-w-md w-full font-sans">
          <div className="flex justify-between items-center mb-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            <span>{t.progressLabel}</span>
            <span className="text-[#002F6C] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[#002F6C] rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Book Outer Binder */}
      <div className="relative w-full max-w-4xl min-h-[580px] rounded-lg bg-[#fffef8] border-l-8 md:border-l-[12px] border-[#002F6C] shadow-2xl border-t border-b border-r border-[#d1cfc5] overflow-hidden p-4 md:p-8 text-gray-800 flex flex-col justify-between">

        {/* ================= COVER PAGE ================= */}
        {currentPage === 0 && (
          <div className="relative w-full flex justify-center items-center overflow-hidden bg-[#fffef8] aspect-[3/4.2]">
            {/* Background image */}
            <img
              src={albumCoverImg}
              alt="Bosnia WC2026 Football Album Cover"
              className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
            />

            {/* Slide animation container */}
            <div
              className={`absolute inset-0 transition-transform duration-700 ease-in-out translate-y-0`}
            >
              {/* Button at bottom */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <button
                  id="album-flip-open-btn"
                  onClick={() => {
                    handleNextPage();
                  }}
                  className="py-3 px-8 rounded-lg bg-[#002F6C] hover:bg-[#0c3f82] text-white font-sans font-bold uppercase text-xs tracking-wider transition shadow-sm flex items-center space-x-2 cursor-pointer"
                >
                  <span>{t.flipOpenButton}</span>
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================= INDIVIDUAL STANDARD PAGES ================= */}
        {currentPage > 0 && (
          <div className="w-full flex-1 flex flex-col justify-between z-20">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 pb-3 mb-5 px-1 font-sans gap-2">
              <div className="text-left animate-fade-in">
                <span className="text-[10px] tracking-widest text-[#002F6C] font-bold uppercase">
                  {t.wcEdition}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#002F6C] uppercase leading-none">
                  {currentPage === 5 ? t.specialSpotsHeader : `${lang === "BS" ? "Sastav BiH — Stranica" : "Bosnian Squad — Page"} ${currentPage}`}
                </h2>
              </div>
              <div className="text-right">
                <span className="p-1 px-2.5 bg-[#002F6C]/10 border border-[#002F6C]/20 rounded-lg text-xs font-black text-[#002F6C]">
                  {t.slotRange}: {getPageStickers(currentPage)[0]?.number} - {getPageStickers(currentPage)[getPageStickers(currentPage).length - 1]?.number}
                </span>
              </div>
            </div>

            {/* Sticker layout helper and grid */}
            {(() => {
              const renderStickerSlot = (st: Sticker) => {
                const userRecord = collection.find(c => c.stickerId === st.id);
                const isPasted = userRecord?.pasted;
                const balanceCount = userRecord?.count || 0;
                const displayRole = PLAYER_TRANSLATIONS[st.id]?.role[lang] || st.role;

                return (
                  <div
                    key={st.id}
                    onClick={() => onViewSticker(st)}
                    className="relative rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    {!isPasted ? (
                      /* Empty Dotted slot where sticker goes */
                      <div className="w-full aspect-[3/4.2] border-2 border-dashed border-gray-300 hover:border-[#002F6C] bg-white/45 flex flex-col justify-between p-3.5 text-center transition rounded-xl">
                        <div className="flex justify-between items-start font-sans">
                          <span className="text-[10px] text-gray-500 font-extrabold bg-[#f4f2e9] border border-gray-300 px-1.5 py-0.5 rounded shadow-sm flex-shrink-0">
                            {st.number}
                          </span>
                          {balanceCount > 0 && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 animate-pulse font-bold">
                              {balanceCount} {lang === "BS" ? "u kesici" : "in pouch"}
                            </span>
                          )}
                        </div>

                        <div className="my-auto py-2">
                          <div className="h-6 w-6 text-gray-400 mx-auto mb-1 flex items-center justify-center text-lg">👤</div>
                          <h4 className="font-sans font-black text-xs text-gray-700 truncate tracking-tight uppercase">
                            {st.name}
                          </h4>
                          <span className="text-[8px] sm:text-[9px] text-gray-500 italic block mt-0.5">{displayRole} • {st.club}</span>
                        </div>

                        <div className="text-[8px] font-sans text-gray-400 font-bold uppercase tracking-wider text-center">
                          {st.type === StickerType.SPECIAL ? (lang === "BS" ? "★ Specijalno" : "★ Special") : (lang === "BS" ? "Standardno" : "Standard")}
                        </div>
                      </div>
                    ) : (
                      /* Real pasted sticker card */
                      (() => {
                        const { ipfs, local } = getPlayerImage(st);
                        return (
                          <div
                            className={`w-full border-4 border-[#00f0ff] rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.55)] flex flex-col text-left hover:shadow-[0_0_20px_rgba(0,240,255,0.85)] transition-all overflow-hidden ${!ipfs && !local ? "bg-gradient-to-b from-[#124285] to-[#002F6C] aspect-[3/4.2] justify-end" : "bg-white"}`}
                          >
                            {(ipfs || local) && (
                              <div className="relative w-full bg-white flex flex-col justify-end">
                                <img
                                  src={ipfs}
                                  alt={st.name}
                                  className="w-full h-auto object-contain block"
                                  onError={(e) => {
                                    if (local) (e.currentTarget as HTMLImageElement).src = local;
                                  }}
                                />
                              </div>
                            )}
                            {!ipfs && !local && (
                              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10 relative">
                                {st.id === 27 ? (
                                  <img src={logoImage} alt="Zmajevi Gold Crest" className="h-10 w-10 object-contain filter drop-shadow-[0_0_8px_rgba(255,205,0,0.85)] shrink-0" referrerPolicy="no-referrer" />
                                ) : st.type === StickerType.SPECIAL ? (
                                  <Star className="h-8 w-8 text-[#FFCD00] drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                                ) : (
                                  <span className="text-xl">⚽</span>
                                )}
                              </div>
                            )}
                            <div className="p-2 bg-[#002F6C]/95 border-t border-[#00f0ff]/50 text-center shadow-md relative z-20 font-sans shrink-0">
                              <h4 className="font-sans font-black text-[10px] sm:text-[10.5px] text-[#FFCD00] truncate leading-tight">{st.name}</h4>
                              <p className="text-[8px] sm:text-[8.5px] text-white/95 font-bold block mt-0.5 uppercase tracking-wide truncate">{displayRole} • {st.club}</p>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              };

              if (currentPage !== 5) {
                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 flex-1 items-start px-1 animate-fade-in">
                    {getPageStickers(currentPage).map((st) => renderStickerSlot(st))}
                  </div>
                );
              } else {
                return (
                  <div className="space-y-6 flex-1 px-1 animate-fade-in text-left">
                    {/* Player 24 & 25 */}
                    <div>
                      <span className="text-[10px] font-sans font-bold text-gray-400 tracking-wider uppercase block mb-1.5">
                        {lang === "BS" ? "Rezervni igrači — Brojevi 12 i 25" : "Substitution Players — Numbers 12 and 25"}
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                        {renderStickerSlot(STICKERS[23])}
                        {renderStickerSlot(STICKERS[24])}
                      </div>
                    </div>

                    {/* Highly Elegant Separator Line */}
                    <div className="py-2.5 flex items-center space-x-3 text-[#002F6C]">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#002F6C]/35 to-transparent flex-1" />
                      <span className="text-[9.5px] sm:text-[10.5px] font-sans font-black tracking-[0.22em] uppercase text-center shrink-0">
                        {lang === "BS" ? "★ SPECIJALNA KOLEKCIJA BOSANSKIH SIMBOLA (26 - 29) ★" : "★ SPECIAL HERITAGE COLLECTION (26 - 29) ★"}
                      </span>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#002F6C]/35 to-transparent flex-1" />
                    </div>

                    {/* Special Memorabilia Spots 26, 27, 28, 29 */}
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {STICKERS.slice(25, 29).map((st) => renderStickerSlot(st))}
                      </div>
                    </div>
                  </div>
                );
              }
            })()}

            {/* Pagination Controls inside the footer binder */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300 px-1 text-xs font-sans font-black text-gray-500">
              <button
                onClick={handlePrevPage}
                className="flex items-center space-x-1 py-1.5 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-[#002F6C] shadow-sm transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-[#002F6C]" />
                <span className="hidden sm:inline">{currentPage === 1 ? t.backCover : t.prevPage}</span>
                <span className="sm:hidden">{lang === "BS" ? "Nazad" : "Back"}</span>
              </button>

              <span className="text-gray-400 uppercase tracking-widest text-[9px] sm:text-[10px]">
                {currentPage === 5 ? t.specialSpotsHeader : `${lang === "BS" ? "Stranica" : "Page"} ${currentPage} / 5`}
              </span>

              <button
                disabled={currentPage === 5}
                onClick={handleNextPage}
                className="flex items-center space-x-1 py-1.5 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-[#002F6C] shadow-sm transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">{t.nextPage}</span>
                <span className="sm:hidden">{lang === "BS" ? "Dalje" : "Next"}</span>
                <ChevronRight className="h-4 w-4 text-[#002F6C]" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 100% Completion Reward Modal — Epic NFT Mint */}
      {pastedCount === totalPossible && !hasClaimedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-br from-[#010b1f] via-[#021430] to-[#000812] border-2 border-[#FFCD00] rounded-3xl p-6 md:p-8 max-w-xl w-full text-center shadow-[0_0_60px_rgba(255,205,0,0.5),0_0_120px_rgba(0,240,255,0.2)] text-white animate-fade-in relative overflow-hidden">

            {/* Ambient glow blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#FFCD00] opacity-10 blur-3xl rounded-full animate-pulse" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#00f0ff] opacity-10 blur-3xl rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500 opacity-5 blur-3xl rounded-full" />
            </div>

            {/* Header badge */}
            <div className="relative z-10 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFCD00] text-[#002F6C] rounded-full text-[10px] font-sans font-black uppercase tracking-widest shadow-lg">
                <Star className="h-3 w-3" fill="currentColor" />
                {lang === "BS" ? "KOLEKCIJA POTPUNA — EPSKA NAGRADA" : "COLLECTION COMPLETE — EPIC NFT REWARD"}
              </span>
            </div>

            {/* Epic NFT Card Display */}
            <div className="relative z-10 mx-auto w-full max-w-[280px] mb-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#FFCD00] shadow-[0_0_30px_rgba(255,205,0,0.6),0_0_60px_rgba(255,205,0,0.2)] group">
                {/* Holographic shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FFCD00]/10 via-transparent to-[#00f0ff]/10 group-hover:from-[#00f0ff]/15 group-hover:to-[#FFCD00]/15 transition-all duration-700 z-10 pointer-events-none rounded-2xl" />
                <img
                  src={rewardGoldenCrestImg}
                  alt="Golden Crest Reward NFT"
                  className="w-full h-auto block object-contain"
                />
                {/* EPIC badge overlay */}
                <div className="absolute top-2 right-2 bg-[#FFCD00] text-[#002F6C] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full z-20 shadow-md">
                  ★ EPIC
                </div>
              </div>
              {/* IPFS provenance line */}
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="text-[9px] text-[#00f0ff] font-mono font-bold uppercase tracking-wider opacity-80">IPFS</span>
                <span className="text-[9px] font-mono text-gray-400 truncate max-w-[200px]">
                  bafybeig...4tumy
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="relative z-10 space-y-1 mb-4">
              <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-[#FFCD00] uppercase leading-none">
                {lang === "BS" ? "Čestitamo, Kolekcionaru!" : "Congratulations, Collector!"}
              </h2>
              <p className="text-xs text-gray-300 font-serif leading-relaxed max-w-sm mx-auto">
                {lang === "BS"
                  ? "Zalijepili ste svih 29 sličica! Zaradili ste ovaj rijetki Zlatni Grb NFT koji je trajan i unosan na Solana blockchainu."
                  : "You pasted all 29 stickers! You've earned this rare Golden Crest NFT — permanently recorded on the Solana blockchain via Metaplex."}
              </p>
            </div>

            {/* Reward breakdown */}
            <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-left space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-sans font-semibold">{lang === "BS" ? "SOL Nagrada" : "SOL Reward"}</span>
                <span className="text-[#14F195] font-mono font-black text-base">2.026 SOL</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-sans font-semibold">{lang === "BS" ? "NFT Certifikat" : "NFT Certificate"}</span>
                <span className="text-[#FFCD00] font-sans font-black text-xs">★ Golden Crest (Epic)</span>
              </div>
              <div className="flex items-start justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-gray-400 font-sans text-xs">Metaplex CID</span>
                <a
                  href={REWARD_GOLDEN_CREST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00f0ff] font-mono text-[10px] hover:underline truncate max-w-[180px] text-right"
                >
                  QmeLB1tybz6ya...LSo2 ↗
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 space-y-3">
              {/* Primary: Mint NFT to Solflare */}
              <button
                onClick={handleMintReward}
                disabled={isMinting}
                className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#FFCD00] via-amber-400 to-[#FFCD00] hover:brightness-110 text-[#002F6C] font-black tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,205,0,0.5)] hover:shadow-[0_0_30px_rgba(255,205,0,0.8)] hover:-translate-y-0.5 cursor-pointer font-sans uppercase flex items-center justify-center gap-2 group ${isMinting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Award className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {isMinting
                  ? (lang === "BS" ? "Mintanje..." : "Minting...")
                  : (lang === "BS" ? "Mintaj NFT u Solflare" : "Mint NFT to Solflare Wallet")}
              </button>

              {/* Secondary: View on IPFS */}
              <a
                href={REWARD_GOLDEN_CREST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-6 rounded-xl border border-[#00f0ff]/40 text-[#00f0ff] font-bold text-xs uppercase tracking-wider hover:bg-[#00f0ff]/10 transition cursor-pointer font-sans flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                {lang === "BS" ? "Pregledaj na IPFS" : "View on IPFS"}
              </a>
            </div>

            {!walletConnected && (
              <p className="text-[10px] font-sans text-rose-400 font-bold uppercase relative z-10 mt-3">
                {lang === "BS" ? "Povežite Solflare novčanik prije preuzimanja!" : "Connect your Solflare wallet before minting!"}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
