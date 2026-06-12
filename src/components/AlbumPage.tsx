import React, { useState } from "react";
import { BookOpen, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Sticker, StickerType, UserSticker } from "../types";
import { STICKERS } from "../data/players";
import logoImage from "./zmajevi logo.webp";
import { Language, UI_TRANSLATIONS, PLAYER_TRANSLATIONS } from "../data/translations";

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

interface AlbumPageProps {
  collection: UserSticker[];
  onViewSticker: (sticker: Sticker) => void;
  pastedCount: number;
  lang: Language;
}

export default function AlbumPage({ collection, onViewSticker, pastedCount, lang }: AlbumPageProps) {
  // - Page 0: Album Cover
  // - Page 1: Starters Part I (Slots 1-6)
  // - Page 2: Starters Part II (Slots 7-11)
  // - Page 3: Substitutions Part I (Slots 12-17)
  // - Page 4: Substitutions Part II (Slots 18-23)
  // - Page 5: Player 24, Separator, Special Collection (Slots 25-28)

  const [currentPage, setCurrentPage] = useState(0);

  const t = UI_TRANSLATIONS[lang];

  const getPageStickers = (pageNum: number): Sticker[] => {
    switch (pageNum) {
      case 1: return STICKERS.slice(0, 6);
      case 2: return STICKERS.slice(6, 12);
      case 3: return STICKERS.slice(12, 18);
      case 4: return STICKERS.slice(18, 24);
      case 5: return STICKERS.slice(24, 28);
      default: return [];
    }
  };

  const playPageSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, audioCtx.currentTime + 0.18);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (_) { }
  };

  const handleNextPage = () => {
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
      playPageSound();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      playPageSound();
    }
  };

  const totalPossible = STICKERS.length;
  const progressPercent = Math.round((pastedCount / totalPossible) * 100);

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

        {/* Subtle & Gorgeous Soccer Field Background Overlay with green touches */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-[#edf8eb] via-[#edf7ec] to-[#f0faf0]">
          <svg className="w-full h-full text-[#2e7d32]/25" viewBox="0 0 100 64" fill="none" stroke="currentColor" strokeWidth="0.7">
            {/* Outer Pitch Border (soft green field background) */}
            <rect x="2" y="2" width="96" height="60" fill="#ccf0c8" fillOpacity="0.32" stroke="currentColor" strokeWidth="0.7" />

            {/* Center Circle */}
            <circle cx="50" cy="32" r="10" />
            <circle cx="50" cy="32" r="0.8" fill="currentColor" />

            {/* Left Penalty Area */}
            <rect x="2" y="16" width="16" height="32" />
            {/* Left Goal Area */}
            <rect x="2" y="24" width="6" height="16" />
            {/* Left Penalty Spot */}
            <circle cx="14" cy="32" r="0.6" fill="currentColor" />
            {/* Left Box D-Arc */}
            <path d="M 18,26.5 A 10,10 0 0,1 18,37.5" />

            {/* Right Penalty Area */}
            <rect x="82" y="16" width="16" height="32" />
            {/* Right Goal Area */}
            <rect x="92" y="24" width="6" height="16" />
            {/* Right Penalty Spot */}
            <circle cx="86" cy="32" r="0.6" fill="currentColor" />
            {/* Right Box D-Arc */}
            <path d="M 82,26.5 A 10,10 0 0,0 82,37.5" />

            {/* Corner Arcs */}
            <path d="M 2,5 A 3,3 0 0,0 5,2" />
            <path d="M 2,59 A 3,3 0 0,1 5,62" />
            <path d="M 98,5 A 3,3 0 0,1 95,2" />
            <path d="M 98,59 A 3,3 0 0,0 95,62" />
          </svg>
        </div>

        {/* ================= COVER PAGE ================= */}
        {currentPage === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-6 max-w-xl mx-auto z-10">
            <span className="text-[10px] font-sans tracking-[0.3em] font-bold text-[#002F6C] uppercase bg-[#002F6C]/10 py-1.5 px-4 rounded-full border border-[#002F6C]/20">
              {t.coverBadge}
            </span>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-[#002F6C] uppercase leading-none">
                {t.coverMainTitle}
              </h1>
              <p className="text-sm font-serif italic text-gray-500">
                {t.coverSubtitle}
              </p>
            </div>

            <div className="relative w-72 h-48 rounded-2xl bg-gradient-to-br from-[#002F6C] via-[#0b1f3c] to-[#01142e] border-4 border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.7)] flex flex-col items-center justify-center p-4">
              <div className="text-center flex flex-col items-center space-y-2">
                <img src={logoImage} alt="Zmajevi BIH Crest" className="w-18 h-18 object-contain drop-shadow-[0_0_8px_rgba(255,205,0,0.55)]" />
                <div>
                  <span className="font-sans font-black text-xs text-[#FFCD00] block tracking-[0.3em] uppercase leading-none">
                    {t.coverHeroes}
                  </span>
                  <span className="text-[9px] mt-1 block text-gray-300">
                    {t.coverCollectibleSlots}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed max-w-sm italic">
              {t.coverText}
            </p>

            <button
              id="album-flip-open-btn"
              onClick={handleNextPage}
              className="py-3 px-8 rounded-lg bg-[#002F6C] hover:bg-[#0c3f82] text-white font-sans font-bold uppercase text-xs tracking-wider transition shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              <span>{t.flipOpenButton}</span>
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
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
                    className="relative aspect-[3/4.2] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    {!isPasted ? (
                      /* Empty Dotted slot where sticker goes */
                      <div className="absolute inset-0 border-2 border-dashed border-gray-300 hover:border-[#002F6C] bg-white/45 flex flex-col justify-between p-3.5 text-center transition">
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
                      <div
                        style={{
                          backgroundImage: getPlayerImage(st) ? `url(${getPlayerImage(st)})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "top",
                        }}
                        className={`absolute inset-0 border-4 border-[#00f0ff] rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.55)] flex flex-col justify-end text-left hover:shadow-[0_0_20px_rgba(0,240,255,0.85)] transition-all overflow-hidden ${!getPlayerImage(st) ? "bg-gradient-to-b from-[#124285] to-[#002F6C]" : "bg-white"
                          }`}
                      >
                        {/* Shimmer physical sticker overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none z-10" />

                        {/* Default emblem placeholder if no player image could be loaded */}
                        {!getPlayerImage(st) && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                            {st.id === 27 ? (
                              <img src={logoImage} alt="Zmajevi Gold Crest" className="h-10 w-10 object-contain filter drop-shadow-[0_0_8px_rgba(255,205,0,0.85)] shrink-0" referrerPolicy="no-referrer" />
                            ) : st.type === StickerType.SPECIAL ? (
                              <Star className="h-8 w-8 text-[#FFCD00] drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
                            ) : (
                              <span className="text-xl">⚽</span>
                            )}
                          </div>
                        )}

                        {/* Clean bottom ribbon display block style */}
                        <div className="p-2 bg-[#002F6C]/95 border-t border-[#00f0ff]/50 text-center shadow-md relative z-20 font-sans">
                          <h4 className="font-sans font-black text-[10px] sm:text-[10.5px] text-[#FFCD00] truncate leading-tight">
                            {st.name}
                          </h4>
                          <p className="text-[8px] sm:text-[8.5px] text-white/95 font-bold block mt-0.5 uppercase tracking-wide truncate">
                            {displayRole} • {st.club}
                          </p>
                        </div>
                      </div>
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
                    {/* Player 24 (Haris Tabakovic) */}
                    <div>
                      <span className="text-[10px] font-sans font-bold text-gray-400 tracking-wider uppercase block mb-1.5">
                        {lang === "BS" ? "Rezervni napadač — Broj 24" : "Substitution Striker — Number 24"}
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                        {renderStickerSlot(STICKERS[23])}
                      </div>
                    </div>

                    {/* Highly Elegant Separator Line */}
                    <div className="py-2.5 flex items-center space-x-3 text-[#002F6C]">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#002F6C]/35 to-transparent flex-1" />
                      <span className="text-[9.5px] sm:text-[10.5px] font-sans font-black tracking-[0.22em] uppercase text-center shrink-0">
                        {lang === "BS" ? "★ SPECIJALNA KOLEKCIJA BOSANSKIH SIMBOLA (25 - 28) ★" : "★ SPECIAL HERITAGE COLLECTION (25 - 28) ★"}
                      </span>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#002F6C]/35 to-transparent flex-1" />
                    </div>

                    {/* Special Memorabilia Spots 25, 26, 27, 28 */}
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {STICKERS.slice(24, 28).map((st) => renderStickerSlot(st))}
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
    </div>
  );
}
