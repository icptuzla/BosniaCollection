import React, { useState, useRef, useEffect } from "react";
import { X, Shield, Calendar, Users, Award, Zap, Activity } from "lucide-react";
import { Sticker, StickerType, UserSticker } from "../types";
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

interface CardDetailProps {
  sticker: Sticker;
  userSticker?: UserSticker;
  onClose: () => void;
  onPaste?: (id: number) => void;
  walletConnected: boolean;
}

export default function CardDetail({ sticker, userSticker, onClose, onPaste, walletConnected }: CardDetailProps) {
  const [foilStyle, setFoilStyle] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  const [scale, setScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dynamically scale card and controls to fit small smartphone screens perfectly
  useEffect(() => {
    const handleResize = () => {
      const padding = 20; // safe padding margins on small screens
      const cardW = 600;
      const cardH = 800; // accounts for close button above and spacing around layout
      
      const scaleW = (window.innerWidth - padding) / cardW;
      const scaleH = (window.innerHeight - padding) / cardH;
      
      // Select the safest minimum scale factor so it fits inside the narrowest boundary
      setScale(Math.min(1, Math.min(scaleW, scaleH)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate holographic tilt effects on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates from -15 to +15 deg
    const rotateY = ((x / rect.width) - 0.5) * 20;
    const rotateX = (((y / rect.height) - 0.5) * -20);
    
    // Normalized shine percentages
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setFoilStyle({ rotateX, rotateY, shineX, shineY });
  };

  const handleMouseLeave = () => {
    setFoilStyle({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  };

  // Play audio synthesize effect when sticking/viewing
  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Sound of looking at card
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Ignored if browser prevents autoplay
    }
  }, [sticker.id]);

  const hasStickerPouch = userSticker && userSticker.count > 0;
  const isPasted = userSticker && userSticker.pasted;

  return (
    <div id="card-detail-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden select-none">
      
      {/* Floating emergency close button for smartphones in top-right corner of viewport */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-[#00f0ff] backdrop-blur-md transition-all duration-200 cursor-pointer z-[60] border border-white/25 flex sm:hidden shadow-lg items-center justify-center"
        title="Close Detail"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Dynamic Scaling Wrapper to enforce exact 600px x 700px specs within mobile viewports */}
      <div 
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        className="relative flex flex-col items-center justify-center transition-transform"
      >
        
        {/* Close Button above the card */}
        <button
          id="btn-close-card-modal"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2.5 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-gray-900 shadow-sm transition cursor-pointer z-50"
          title="Back to Album"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Pure 600px x 700px Card Area */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: "600px",
            height: "700px",
            transform: `perspective(1000px) rotateX(${foilStyle.rotateX}deg) rotateY(${foilStyle.rotateY}deg)`,
            transition: "transform 0.1s ease-out",
          }}
          className="relative rounded-3xl p-6 select-none shadow-[0_0_30px_rgba(0,240,255,0.7)] border-4 border-[#00f0ff] overflow-hidden bg-white text-gray-800 flex flex-col justify-between"
        >
          
          {/* Holographic Refraction Overlay */}
          <div
            style={{
              background: `radial-gradient(circle at ${foilStyle.shineX}% ${foilStyle.shineY}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 65%), linear-gradient(${foilStyle.rotateY * 4}deg, rgba(255,205,0,0.06) 0%, rgba(0,47,108,0.04) 50%, rgba(255,255,255,0.05) 100%)`,
            }}
            className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
          />

          {/* Micro Card grid noise patterns to look like paper/fiber physical sticker */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

          {/* Top Section */}
          <div className="flex justify-between items-start z-20">
            <div className="flex items-center space-x-3 text-left">
              <span className="font-sans text-xl font-black px-3 py-1.5 bg-[#FFCD00] text-[#002F6C] rounded-lg shadow-sm">
                {sticker.number}
              </span>
              <div>
                <h2 className="font-sans font-black text-2xl tracking-tight text-[#002F6C] leading-none mb-1">
                  {sticker.name}
                </h2>
                <p className="text-xs font-sans text-gray-550 font-bold tracking-wide flex items-center space-x-1">
                  <Shield className="h-3.5 w-3.5 text-gray-400" />
                  <span>{sticker.role}</span>
                  <span className="text-gray-300">•</span>
                  <span>{sticker.club}</span>
                </p>
              </div>
            </div>
            {sticker.stats && (
              <div className="text-right">
                <span className="font-sans text-4xl font-black text-[#002F6C] tracking-tight">
                  {sticker.stats.overall}
                </span>
                <p className="text-[9px] font-sans font-bold text-gray-400 tracking-wider block uppercase">{sticker.gameRatingRef}</p>
              </div>
            )}
            {sticker.type === StickerType.SPECIAL && (
              <span className="text-[10px] font-sans px-2.5 py-1 bg-[#FFCD00] text-[#002F6C] rounded font-black uppercase tracking-widest border border-[#FFCD00] shadow-sm">
                ★ Special Art
              </span>
            )}
          </div>

          {/* Core Visual Body */}
          <div className="grid grid-cols-5 gap-4 items-center my-4 z-20 flex-1">
            
            {/* Player Avatar / Dynamic Vector Shield Silhouette */}
            <div className="col-span-2 flex flex-col items-center justify-center relative">
              <div className="relative w-44 h-48 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                
                {/* Floating holographic particle elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#002F6C]/5 to-transparent animate-pulse" />
                
                {getPlayerImage(sticker) ? (
                  <img 
                    src={getPlayerImage(sticker) || undefined} 
                    alt={sticker.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    referrerPolicy="no-referrer" 
                  />
                ) : sticker.type === StickerType.STANDARD ? (
                   // Elegant silhouette representing Crest
                  <div className="relative w-full h-full flex flex-col items-center justify-end pt-6">
                    <div className="w-22 h-22 rounded-full bg-white border border-gray-200 flex items-center justify-center relative shadow-sm">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    {/* Simulated football jersey torso */}
                    <div className="w-32 h-20 bg-gradient-to-b from-[#002F6C] to-[#124285] rounded-t-2xl flex flex-col items-center mt-3 justify-center shadow-md">
                      <span className="text-[9px] font-sans text-[#FFCD00] font-black uppercase tracking-wider">BIH SQUAD</span>
                      <span className="text-base font-sans font-extrabold text-white tracking-widest">{sticker.number}</span>
                    </div>
                  </div>
                ) : sticker.id === 23 ? (
                  // Golden Crest is actually the official Zmajevi logo!
                  <div className="text-center p-3 flex flex-col items-center justify-center">
                    <img src={logoImage} alt="Zmajevi Gold Badge" className="w-28 h-28 object-contain filter drop-shadow-[0_0_12px_rgba(255,205,0,0.85)]" referrerPolicy="no-referrer" />
                    <span className="text-[9px] font-sans text-[#002F6C] block mt-2.5 font-black uppercase tracking-wider">
                      OFFICIAL FA GRB
                    </span>
                  </div>
                ) : (
                  // Special collectible vector emblem rendering
                  <div className="text-center p-4">
                    <Award className="h-16 w-16 mx-auto text-[#FFCD00] animate-pulse drop-shadow-sm" />
                    <span className="text-[9px] font-sans text-[#002F6C] block mt-3 font-bold uppercase tracking-widest">
                      MEMORABILIA TYPE
                    </span>
                  </div>
                )}
              </div>
              
              {/* Sticker physical shadow paper foot label */}
              <div className="mt-2.5 bg-[#fbfaf6] border border-gray-250 rounded py-1 px-3 text-[9px] font-sans font-bold text-gray-500 uppercase tracking-widest">
                MINT: # B-WC26-{sticker.id.toString().padStart(3, "0")}
              </div>
            </div>

            {/* Biography Description */}
            <div className="col-span-3 h-full flex flex-col justify-between text-left pl-2">
              <div className="bg-[#fffdf9] p-4.5 rounded-2xl border border-gray-300 flex-1 flex flex-col justify-between max-h-[210px] overflow-y-auto shadow-inner">
                <div>
                  <h4 className="text-[10px] font-sans uppercase text-[#002F6C] font-black tracking-wider mb-2 flex items-center space-x-1.5">
                    <Activity className="h-3 w-3 text-gray-400" />
                    <span>STORY & BIO</span>
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-serif italic">
                    "{sticker.biography}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-250 text-[10px] font-sans font-bold text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>Born: {sticker.birthDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-[#FFCD00]" />
                    <span>Height: {sticker.height}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="z-20 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left">
            <h3 className="text-[10px] font-sans uppercase tracking-wider text-gray-400 font-bold mb-3">
              REAL WORLD GAME ATTRIBUTES LIST
            </h3>
            
            {sticker.stats ? (
              <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                {[
                  { label: "PAC (Pace)", val: sticker.stats.pace, color: "bg-[#002F6C]" },
                  { label: "SHO (Shooting)", val: sticker.stats.shooting, color: "bg-[#FFCD00]" },
                  { label: "PAS (Passing)", val: sticker.stats.passing, color: "bg-emerald-600" },
                  { label: "DRI (Dribbling)", val: sticker.stats.dribbling, color: "bg-purple-600" },
                  { label: "DEF (Defending)", val: sticker.stats.defending, color: "bg-rose-600" },
                  { label: "PHY (Physical)", val: sticker.stats.physicality, color: "bg-orange-500" }
                ].map((s) => (
                  <div key={s.label} className="text-left">
                    <div className="flex justify-between items-center text-[10px] font-sans font-black text-gray-600 mb-1">
                      <span>{s.label}</span>
                      <span>{s.val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 text-center text-xs font-serif text-gray-500 italic leading-relaxed">
                ★ Special high-level emblem elements do not hold generic play game indexes. Pure collector rarity logic dictates their premium Solana Web3 valuation!
              </div>
            )}
          </div>

          {/* Bottom Action bar */}
          <div className="z-20 flex justify-between items-center mt-3 pt-3 border-t border-gray-200 text-left">
            <div>
              <p className="text-[9px] font-sans font-black text-gray-450 uppercase tracking-widest leading-none mb-1">SOLANA CONTRACT METAPLEX</p>
              <p className="text-xs font-sans text-emerald-700 font-bold flex items-center">
                <span>Verified Metaplex Asset</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {hasStickerPouch && !isPasted && onPaste && (
                <button
                  id="btn-paste-sticker-action"
                  onClick={() => onPaste(sticker.id)}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-sm shrink-0 cursor-pointer"
                >
                  Paste in Album!
                </button>
              )}
              {isPasted ? (
                <span className="py-2 px-4 rounded-xl bg-gray-100 text-gray-600 border border-gray-200 text-xs font-sans font-bold">
                  ✓ Mounted in Album
                </span>
              ) : !hasStickerPouch ? (
                <div className="text-right text-xs font-sans font-bold text-rose-500">
                  <span>Locked • Pouch empty</span>
                </div>
              ) : null}
            </div>
          </div>

        </div>

        {/* Info label under the card */}
        <p className="mt-3 text-[10px] font-sans font-bold text-gray-400 tracking-wider">
          * Drag mouse above to rotate card in real-time physical space.
        </p>

      </div>
    </div>
  );
}
