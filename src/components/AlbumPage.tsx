import React, { useState } from "react";
import { BookOpen, Sparkles, Star, ChevronLeft, ChevronRight, HelpCircle, UserCheck } from "lucide-react";
import { Sticker, StickerType, UserSticker } from "../types";
import { STICKERS } from "../data/players";
import logoImage from "./zmajevi logo.png";

// Import all uploaded player photos
import dzekoImg from "./players/Pi_dzeko.png";
import demirovicImg from "./players/Pi_Demirovic.png";
import dedicImg from "./players/Pi_dedic.png";
import tahirovicImg from "./players/benjamin-tahirovic.png";
import burnicImg from "./players/denis-burnic.png";
import memicImg from "./players/amer-memic.png";
import hadziahmetovicImg from "./players/amir-hadziahmetovic.png";
import alajbegovicImg from "./players/kenan-alajbegovic.png";
import bazdarImg from "./players/samed-bazdar.png";
import radeljicImg from "./players/stjepan-radeljic.png";

const playerImageMap: Record<string, string> = {
  "Pi_dzeko.png": dzekoImg,
  "Pi_Demirovic.png": demirovicImg,
  "Pi_dedic.png": dedicImg,
  "benjamin-tahirovic.png": tahirovicImg,
  "denis-burnic.png": burnicImg,
  "amer-memic.png": memicImg,
  "amir-hadziahmetovic.png": hadziahmetovicImg,
  "kenan-alajbegovic.png": alajbegovicImg,
  "samed-bazdar.png": bazdarImg,
  "stjepan-radeljic.png": radeljicImg,
};

const getPlayerImage = (sticker: Sticker) => {
  if (sticker.imageFile && playerImageMap[sticker.imageFile]) {
    return playerImageMap[sticker.imageFile];
  }
  if (sticker.id === 1) return playerImageMap["Pi_dzeko.png"];
  if (sticker.id === 2) return playerImageMap["Pi_Demirovic.png"];
  if (sticker.id === 5) return playerImageMap["Pi_dedic.png"];
  if (sticker.id === 8) return playerImageMap["benjamin-tahirovic.png"];
  if (sticker.id === 17) return playerImageMap["denis-burnic.png"];
  
  const lowerName = sticker.name.toLowerCase();
  if (lowerName.includes("memic") || lowerName.includes("memić")) return playerImageMap["amer-memic.png"];
  if (lowerName.includes("hadžiahmetović") || lowerName.includes("hadziahmetovic")) return playerImageMap["amir-hadziahmetovic.png"];
  if (lowerName.includes("alajbegović") || lowerName.includes("alajbegovic")) return playerImageMap["kenan-alajbegovic.png"];
  if (lowerName.includes("baždar") || lowerName.includes("bazdar")) return playerImageMap["samed-bazdar.png"];
  if (lowerName.includes("radeljić") || lowerName.includes("radeljic")) return playerImageMap["stjepan-radeljic.png"];
  
  return null;
};

interface AlbumPageProps {
  collection: UserSticker[];
  onViewSticker: (sticker: Sticker) => void;
  pastedCount: number;
}

export default function AlbumPage({ collection, onViewSticker, pastedCount }: AlbumPageProps) {
  // We have 26 stickers total (22 standard players starting at index 0, followed by 4 special collection stickers).
  // Let's divide them into beautiful pages:
  // - page 0: Album Cover
  // - page 1: Standard Players 1 to 6 (IDs 1-6)
  // - page 2: Standard Players 7 to 12 (IDs 7-12)
  // - page 3: Standard Players 13 to 18 (IDs 13-18)
  // - page 4: Standard Players 19 to 22 (IDs 19-22)
  // - page 5: "Special Collection" Page (IDs 23-26 - S1 to S4)
  
  const [currentPage, setCurrentPage] = useState(0);

  const getPageStickers = (pageNum: number): Sticker[] => {
    switch (pageNum) {
      case 1: return STICKERS.slice(0, 6);
      case 2: return STICKERS.slice(6, 12);
      case 3: return STICKERS.slice(12, 18);
      case 4: return STICKERS.slice(18, 22);
      case 5: return STICKERS.slice(22, 26); // The 4 Special Collection positions!
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
    } catch (_) {}
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
          <div className="text-left">
            <h3 className="font-sans font-bold text-base text-[#002F6C] uppercase tracking-tight">STicker Collection Progression</h3>
            <p className="text-xs font-serif italic text-gray-500">
              Pasted: <span className="text-[#002F6C] font-bold">{pastedCount}</span> of {totalPossible} standard spots
            </p>
          </div>
        </div>

        {/* Dynamic gauge bar */}
        <div className="flex-1 max-w-md w-full">
          <div className="flex justify-between items-center mb-1 text-[10px] font-sans font-bold tracking-wider text-gray-450 uppercase">
            <span>COLLECTION PROGRESS</span>
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
        
        {/* Physical Album Book split seam cord */}
        {currentPage > 0 && currentPage < 5 && (
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-r from-gray-200 via-[#d1cfc5] to-gray-200 -ml-1 z-30 shadow-inner hidden md:block" />
        )}

        {/* ================= COVER PAGE ================= */}
        {currentPage === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-6 max-w-xl mx-auto">
            <span className="text-[10px] font-sans tracking-[0.3em] font-bold text-[#002F6C] uppercase bg-[#002F6C]/10 py-1.5 px-4 rounded-full border border-[#002F6C]/20">
              ★ PANINI WORLD CUP 2026 EDITION ★
            </span>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-sans font-black tracking-tighter text-[#002F6C] uppercase leading-none">
                BOSNA I HERCEGOVINA
              </h1>
              <p className="text-sm font-serif italic text-gray-500">
                Official Digital Web3 Sticker Album
              </p>
            </div>

            <div className="relative w-72 h-48 rounded-2xl bg-gradient-to-br from-[#002F6C] via-[#0b1f3c] to-[#01142e] border-4 border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.7)] flex flex-col items-center justify-center p-4">
              <div className="text-center flex flex-col items-center space-y-2">
                <img src={logoImage} alt="Zmajevi BIH Crest" className="w-20 h-20 object-contain drop-shadow-[0_0_8px_rgba(255,205,0,0.55)]" />
                <div>
                  <span className="font-sans font-black text-xs text-[#FFCD00] block tracking-[0.3em] uppercase leading-none">
                    ZMAJEVI HEROES
                  </span>
                  <span className="text-[9px] font-mono text-gray-300 mt-1 block">26 COLLECTIBLE SLOTS</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-serif text-gray-600 leading-relaxed max-w-sm italic">
              Explore dynamic team selections, physical sticker metrics, and verified peer-to-peer bartering. Complete your binder to mint your Metaplex album certificate.
            </p>

            <button
              id="album-flip-open-btn"
              onClick={handleNextPage}
              className="py-3 px-8 rounded-lg bg-[#002F6C] hover:bg-[#0c3f82] text-white font-sans font-bold uppercase text-xs tracking-wider transition shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              <span>Flip Open Album</span>
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* ================= INDIVIDUAL STANDARD PAGES ================= */}
        {currentPage > 0 && (
          <div className="w-full flex-1 flex flex-col justify-between z-20">
            
            {/* Page header */}
            <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-5 px-1">
              <div className="text-left">
                <span className="text-[10px] font-sans tracking-widest text-[#002F6C] font-bold uppercase">
                  BOSNIAN WC2026 EDITION
                </span>
                <h2 className="text-xl font-sans font-black text-[#002F6C] uppercase leading-none">
                  {currentPage === 5 ? "Special Collection Spots" : `Bosnian Squad — Page ${currentPage}`}
                </h2>
              </div>
              <div className="text-right">
                <span className="p-1.5 px-3 bg-[#002F6C]/10 border border-[#002F6C]/20 rounded-lg text-xs font-sans font-black text-[#002F6C]">
                  Slot Range: {getPageStickers(currentPage)[0]?.number} - {getPageStickers(currentPage)[getPageStickers(currentPage).length - 1]?.number}
                </span>
              </div>
            </div>

            {/* Sticker layout grid */}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${currentPage === 4 ? "md:grid-cols-4" : ""} gap-4 md:gap-5 flex-1 items-start px-1`}>
              {getPageStickers(currentPage).map((st) => {
                const userRecord = collection.find(c => c.stickerId === st.id);
                const isPasted = userRecord?.pasted;
                const balanceCount = userRecord?.count || 0;

                return (
                  <div
                    key={st.id}
                    onClick={() => onViewSticker(st)}
                    className="relative aspect-[3/4.2] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    {!isPasted ? (
                      /* Empty Dotted slot where sticker goes */
                      <div className="absolute inset-0 border-2 border-dashed border-gray-300 hover:border-[#002F6C] bg-white/45 flex flex-col justify-between p-3.5 text-center transition">
                        <div className="flex justify-between items-start">
                          <span className="font-sans text-[10px] text-gray-500 font-extrabold bg-[#f4f2e9] border border-gray-350 px-1.5 py-0.5 rounded shadow-sm">
                            {st.number}
                          </span>
                          {balanceCount > 0 && (
                            <span className="text-[9px] font-sans px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-250 animate-pulse font-bold">
                              {balanceCount} in pouch
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 my-auto py-4">
                          <HelpCircle className="h-7 w-7 text-gray-400 mx-auto" />
                          <h4 className="font-sans font-black text-xs text-gray-700 truncate tracking-tight uppercase">
                            {st.name.split(" ").slice(-1)[0]}
                          </h4>
                          <span className="text-[9px] font-serif text-gray-450 italic block">{st.role}</span>
                        </div>

                        <div className="text-[9px] font-sans text-gray-400 font-bold uppercase tracking-wider text-center">
                          {st.type === StickerType.SPECIAL ? "★ Special Art" : "Standard slot"}
                        </div>
                      </div>
                    ) : (
                      /* Real pasted sticker card */
                      <div className="absolute inset-0 bg-white p-2.5 relative border-4 border-[#00f0ff] rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.55)] flex flex-col justify-between text-left hover:shadow-[0_0_20px_rgba(0,240,255,0.85)] transition-all">
                        {/* Shimmer physical sticker overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#002F6C]/5 to-transparent pointer-events-none" />

                        <div className="flex justify-between items-start">
                          <span className="font-sans text-[10px] font-black px-1.5 py-0.5 bg-[#FFCD00] text-[#002F6C] rounded shadow-sm">
                            {st.number}
                          </span>
                          <span className="text-[9px] font-sans text-emerald-700 font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">
                            ✓ PASTE
                          </span>
                        </div>

                        <div className="my-auto text-left pl-1 flex items-center space-x-2">
                          {getPlayerImage(st) ? (
                            <div className="w-10 h-10 rounded-full border border-[#00f0ff] overflow-hidden shadow-sm shrink-0 flex items-center justify-center bg-gray-50 bg-cover bg-center" style={{ backgroundImage: `url(${getPlayerImage(st)})` }} />
                          ) : st.id === 23 ? (
                            <img src={logoImage} alt="Zmajevi Gold Crest" className="h-9 w-9 object-contain filter drop-shadow-[0_0_4px_rgba(255,205,0,0.5)] shrink-0" referrerPolicy="no-referrer" />
                          ) : st.type === StickerType.SPECIAL ? (
                            <Star className="h-5 w-5 text-[#FFCD00] mb-1.5 animate-pulse shrink-0" />
                          ) : (
                            <div className="text-[9px] font-sans font-bold text-[#002F6C] block leading-none opacity-60 mb-1 shrink-0">
                              {st.role}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-sans font-black text-xs text-[#002F6C] leading-tight truncate">
                              {st.name}
                            </h4>
                            <span className="text-[9px] font-serif text-gray-500 italic block mt-0.5 truncate max-w-full">
                              {st.club}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-sans text-gray-500 pt-1.5 border-t border-gray-200">
                          <span className="font-bold tracking-widest text-emerald-600 uppercase text-[8px]">Web3 Live</span>
                          {st.stats && <span className="font-black text-[#002F6C]">OVR {st.stats.overall}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls inside the footer binder */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300 px-1 text-xs font-sans font-black text-gray-500">
              <button
                onClick={handlePrevPage}
                className="flex items-center space-x-1 py-1.5 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-[#002F6C] shadow-sm transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-[#002F6C]" />
                <span>Go Back</span>
              </button>

              <span className="text-gray-400 uppercase tracking-widest text-[10px]">
                {currentPage === 5 ? "Special Collections Page" : `Page ${currentPage} of 5`}
              </span>

              <button
                disabled={currentPage === 5}
                onClick={handleNextPage}
                className="flex items-center space-x-1 py-1.5 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-[#002F6C] shadow-sm transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Next Page</span>
                <ChevronRight className="h-4 w-4 text-[#002F6C]" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
