import React, { useState } from "react";
import { BookOpen, Star, ChevronLeft, ChevronRight, User } from "lucide-react";
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
      case 2: return STICKERS.slice(6, 11);
      case 3: return STICKERS.slice(11, 17);
      case 4: return STICKERS.slice(17, 23);
      case 5: return STICKERS.slice(23, 29);
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
      <div className="w-full max-w-4xl bg-surface border border-border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-5 text-text">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-primary/15 rounded-xl text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="text-left font-sans">
            <h3 className="font-bold text-base text-text uppercase tracking-tight">{t.progressionTitle}</h3>
            <p className="text-xs text-text-muted">
              {t.pastedCountLabel}: <span className="text-text font-bold">{pastedCount}</span> {t.ofLabel} {totalPossible} {t.spotsLabel}
            </p>
          </div>
        </div>

        {/* Dynamic gauge bar */}
        <div className="flex-1 max-w-md w-full font-sans">
          <div className="flex justify-between items-center mb-1 text-[11px] font-bold tracking-wider text-text-dim uppercase">
            <span>{t.progressLabel}</span>
            <span className="text-text font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Book Outer Binder */}
      <div className="relative w-full max-w-4xl min-h-[580px] rounded-lg bg-surface border-l-4 border-l-primary border border-border shadow-lg shadow-black/40 overflow-hidden p-4 md:p-8 text-text flex flex-col justify-between">

        {/* ================= COVER PAGE ================= */}
        {currentPage === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-6 max-w-xl mx-auto z-10">
            <span className="text-[11px] font-sans tracking-[0.3em] font-bold text-gold uppercase bg-gold/15 py-1.5 px-4 rounded-full border border-gold/30">
              {t.coverBadge}
            </span>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-text uppercase leading-none">
                {t.coverMainTitle}
              </h1>
              <p className="text-sm font-sans text-text-muted">
                {t.coverSubtitle}
              </p>
            </div>

            <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center p-2">
              <img src={logoImage} alt="Zmajevi BIH Crest" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1">
              <span className="font-sans font-black text-xs text-gold block tracking-[0.3em] uppercase leading-none">
                {t.coverHeroes}
              </span>
              <span className="text-[11px] block text-text-muted">
                {t.coverCollectibleSlots}
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              {t.coverText}
            </p>

            <button
              id="album-flip-open-btn"
              onClick={handleNextPage}
              className="py-3 px-8 rounded-xl bg-primary hover:bg-primary-hover text-white font-sans font-bold uppercase text-xs tracking-wider transition flex items-center space-x-2 cursor-pointer"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-3 mb-5 px-1 font-sans gap-2">
              <div className="text-left animate-fade-in">
                <span className="text-[11px] tracking-widest text-text-muted font-bold uppercase">
                  {t.wcEdition}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-text uppercase leading-none">
                  {currentPage === 5 ? t.specialSpotsHeader : `${lang === "BS" ? "Sastav BiH — Stranica" : "Bosnian Squad — Page"} ${currentPage}`}
                </h2>
              </div>
              <div className="text-right">
                <span className="p-1 px-2.5 bg-primary/15 border border-primary/30 rounded-lg text-xs font-black text-primary">
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
                const isSpecial = st.type === StickerType.SPECIAL;

                return (
                  <div
                    key={st.id}
                    onClick={() => onViewSticker(st)}
                    className="relative aspect-[3/4.2] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    {!isPasted ? (
                      /* Empty Dotted slot where sticker goes */
                      <div className={`card-slot absolute inset-0 flex flex-col justify-between p-3.5 text-center ${isSpecial ? "shimmer-gold" : ""}`}>
                        <div className="flex justify-between items-start font-sans">
                          <span className="text-[11px] text-text-muted font-extrabold bg-surface-2 border border-border px-1.5 py-0.5 rounded flex-shrink-0">
                            {st.number}
                          </span>
                          {balanceCount > 0 && (
                            <span className="text-[11px] px-1.5 py-0.5 bg-success/15 text-success rounded-full border border-success/30 font-bold">
                              {balanceCount} {lang === "BS" ? "u kesici" : "in pouch"}
                            </span>
                          )}
                        </div>

                        <div className="my-auto py-2">
                          <div className="mx-auto mb-1 flex items-center justify-center">
                            <User className="h-6 w-6 text-text-dim" />
                          </div>
                          <h4 className="font-sans font-black text-xs text-text-muted truncate tracking-tight uppercase">
                            {st.name}
                          </h4>
                          <span className="text-[11px] text-text-dim block mt-0.5">{displayRole} • {st.club}</span>
                        </div>

                        <div className="text-[11px] font-sans text-text-dim font-bold uppercase tracking-wider text-center">
                          {isSpecial ? (lang === "BS" ? "★ Specijalno" : "★ Special") : (lang === "BS" ? "Standardno" : "Standard")}
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
                        className={`absolute inset-0 border-2 ${isSpecial ? "border-gold/40" : "border-border"} rounded-xl flex flex-col justify-end text-left transition-all overflow-hidden ${!getPlayerImage(st) ? "bg-gradient-to-b from-surface-3 to-base" : "bg-base"
                          } ${isSpecial ? "shimmer-gold" : ""}`}
                      >
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

                        {/* Default emblem placeholder if no player image could be loaded */}
                        {!getPlayerImage(st) && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                            {st.id === 27 ? (
                              <img src={logoImage} alt="Zmajevi Gold Crest" className="h-10 w-10 object-contain shrink-0" referrerPolicy="no-referrer" />
                            ) : isSpecial ? (
                              <Star className="h-8 w-8 text-gold" />
                            ) : (
                              <User className="h-8 w-8 text-text-dim" />
                            )}
                          </div>
                        )}

                        {/* Clean bottom ribbon display block style */}
                        <div className="p-2 bg-base/95 border-t border-gold/40 text-center relative z-20 font-sans">
                          <h4 className="font-sans font-black text-[11px] text-gold truncate leading-tight">
                            {st.name}
                          </h4>
                          <p className="text-[11px] text-text-muted font-bold block mt-0.5 uppercase tracking-wide truncate">
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
                    {/* Player 24 & 25 */}
                    <div>
                      <span className="text-[11px] font-sans font-bold text-text-muted tracking-wider uppercase block mb-1.5">
                        {lang === "BS" ? "Rezervni igrači — Brojevi 12 i 25" : "Substitution Players — Numbers 12 and 25"}
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                        {renderStickerSlot(STICKERS[23])}
                        {renderStickerSlot(STICKERS[24])}
                      </div>
                    </div>

                    {/* Elegant Separator Line */}
                    <div className="py-2.5 flex items-center space-x-3 text-gold">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold/35 to-transparent flex-1" />
                      <span className="text-[11px] font-sans font-black tracking-[0.22em] uppercase text-center shrink-0">
                        {lang === "BS" ? "★ SPECIJALNA KOLEKCIJA BOSANSKIH SIMBOLA (26 - 29) ★" : "★ SPECIAL HERITAGE COLLECTION (26 - 29) ★"}
                      </span>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-gold/35 to-transparent flex-1" />
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
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border px-1 text-xs font-sans font-bold">
              <button
                onClick={handlePrevPage}
                className="flex items-center space-x-1 py-2.5 px-4 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{currentPage === 1 ? t.backCover : t.prevPage}</span>
                <span className="sm:hidden">{lang === "BS" ? "Nazad" : "Back"}</span>
              </button>

              <span className="text-text-dim uppercase tracking-widest text-[11px]">
                {currentPage === 5 ? t.specialSpotsHeader : `${lang === "BS" ? "Stranica" : "Page"} ${currentPage} / 5`}
              </span>

              <button
                disabled={currentPage === 5}
                onClick={handleNextPage}
                className="flex items-center space-x-1 py-2.5 px-4 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">{t.nextPage}</span>
                <span className="sm:hidden">{lang === "BS" ? "Dalje" : "Next"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
