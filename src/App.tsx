import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Coins, ShoppingBag, ArrowLeftRight, Volume2, VolumeX, Award, HelpCircle, BadgeCheck, CheckCircle2, Star, Trophy } from "lucide-react";
import { Sticker, UserSticker, TradeOffer, WalletState, StickerType } from "./types";
import { STICKERS } from "./data/players";
import logoImage from "./components/zmajevi logo.webp";
import { UI_TRANSLATIONS, Language } from "./data/translations";
import { SpeedInsights } from "@vercel/speed-insights/react"
// Import custom sub-components
import SolflareWallet from "./components/SolflareWallet";
import AlbumPage from "./components/AlbumPage";
import PackOpener from "./components/PackOpener";
import TradeMarket from "./components/TradeMarket";
import CardDetail from "./components/CardDetail";

import HistoryPage from "./components/HistoryPage";

export default function App() {
  // --- STATE SYSTEM ---
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("zmajevi_lang_pref");
    return (saved as Language) || "BS";
  });

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("zmajevi_lang_pref", newLang);
  };

  const [activeTab, setActiveTab] = useState<"album" | "pouch" | "packs" | "trades" | "history">("album");
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
  });

  const [collection, setCollection] = useState<UserSticker[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(() => {
    return localStorage.getItem("bosnia_wc26_reward_claimed") === "true";
  });
  const [mintedStickers, setMintedStickers] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("bosnia_wc26_minted_stickers");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const handleRegisterMint = (id: number) => {
    setMintedStickers(prev => {
      const updated = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem("bosnia_wc26_minted_stickers", JSON.stringify(updated));
      return updated;
    });
  };

  // --- INITIAL SEEDING ---
  useEffect(() => {
    // Load collection from localStorage
    const savedCollection = localStorage.getItem("bosnia_ sticker_collection_wc26");
    if (savedCollection) {
      setCollection(JSON.parse(savedCollection));
    } else {
      // Seed default starting stickers already pasted (Edin Džeko, Ermedin Demirović, and the Golden Crest)
      // and give them 1 duplication of Dennis Hadžikadunić so they can immediately see duplications/trade!
      const initialSeed: UserSticker[] = [
        { stickerId: 9, count: 1, pasted: true }, // Edin Džeko (pasted)
        { stickerId: 10, count: 1, pasted: true }, // Ermedin Demirović (pasted)
        { stickerId: 27, count: 1, pasted: true }, // Golden Crest (pasted)
        { stickerId: 14, count: 2, pasted: false }, // Hadžikadunić (Has 2 duplicates, unpasted)
      ];
      setCollection(initialSeed);
      localStorage.setItem("bosnia_ sticker_collection_wc26", JSON.stringify(initialSeed));
    }

    // Seed interactive trade offers to make the P2P center fully alive out of the box!
    const savedOffers = localStorage.getItem("bosnia_sticker_trades_wc26");
    if (savedOffers) {
      setTradeOffers(JSON.parse(savedOffers));
    } else {
      const liveOffers: TradeOffer[] = [
        {
          id: "tx-trd-hadziahmetovic-demirovic",
          ownerAddress: "SolfP2Pm88SarajevoXyZ",
          ownerName: "SarajevoCollector_99",
          offeredStickerId: 12, // Amir Hadžiahmetović
          requestedStickerId: 10, // Demirović
          status: "OPEN",
          createdAt: Date.now() - 3600000,
        },
        {
          id: "tx-trd-bilino-sol",
          ownerAddress: "SolfZenicaStadiumHost",
          ownerName: "Zenica_Tornado_88",
          offeredStickerId: 28, // Stadion Bilino Polje (Special)
          requestedStickerId: -1, // Selling for SOL
          solPrice: 1.5,
          status: "OPEN",
          createdAt: Date.now() - 7200000,
        },
        {
          id: "tx-trd-bajraktarevic-tabakovic",
          ownerAddress: "SolfDiasporaBosnjak",
          ownerName: "BHFanatic_Tuzla",
          offeredStickerId: 11, // Esmir Bajraktarević
          requestedStickerId: 21, // Haris Tabaković
          status: "OPEN",
          createdAt: Date.now() - 200000,
        },
        {
          id: "tx-trd-dedic-kolasinac",
          ownerAddress: "SolfSalzburgFanatic",
          ownerName: "Amar_D_Zmaj",
          offeredStickerId: 5, // Amar Dedić
          requestedStickerId: 3, // Kolašinac
          status: "OPEN",
          createdAt: Date.now() - 50000,
        }
      ];
      setTradeOffers(liveOffers);
      localStorage.setItem("bosnia_sticker_trades_wc26", JSON.stringify(liveOffers));
    }
  }, []);

  // Save collection changes
  const saveCollection = (newColl: UserSticker[]) => {
    setCollection(newColl);
    localStorage.setItem("bosnia_ sticker_collection_wc26", JSON.stringify(newColl));
  };

  // --- AUDIO SYNTHESIZER ENGINE (Immersive Arena Sounds & Effects) ---

  // --- STICKER INTERACTIONS ---
  const handleAddStickers = (ids: number[]) => {
    const updated = [...collection];
    ids.forEach(id => {
      const existing = updated.find(r => r.stickerId === id);
      if (existing) {
        existing.count += 1;
      } else {
        updated.push({ stickerId: id, count: 1, pasted: false });
      }
    });
    saveCollection(updated);
  };

  const handlePasteStickerInAlbum = (id: number) => {
    const updated = [...collection];
    const target = updated.find(r => r.stickerId === id);
    if (target && target.count > 0 && !target.pasted) {
      target.pasted = true;
      target.count -= 1; // deduct sticker from pouch when pasting


      saveCollection(updated);
      setSelectedSticker(null); // Close detail view upon mounting success

      // Flash a little custom feedback
      alert(`Success! Mounted ${STICKERS.find(s => s.id === id)?.name} onto page slot successfully.`);
    }
  };

  const handleTradeCompleted = (offeredId: number, requestedId: number, solPrice?: number) => {
    const updated = [...collection];

    // Deduct offered or requested card
    if (offeredId !== -1) {
      const offeredRecord = updated.find(r => r.stickerId === offeredId);
      if (offeredRecord) {
        offeredRecord.count = Math.max(0, offeredRecord.count - 1);
      }
    }

    // Add received card
    if (requestedId !== -1) {
      const requestedRecord = updated.find(r => r.stickerId === requestedId);
      if (requestedRecord) {
        requestedRecord.count += 1;
      } else {
        updated.push({ stickerId: requestedId, count: 1, pasted: false });
      }
    }

    // If we received SOL for listing ourselves
    if (solPrice && offeredId === -1) {
      setWallet(prev => ({
        ...prev,
        balance: Number((prev.balance + solPrice).toFixed(2)),
      }));
    }

    saveCollection(updated);
  };

  const handleSelfTradePosted = (offer: TradeOffer) => {
    const updatedOffers = [offer, ...tradeOffers];
    setTradeOffers(updatedOffers);
    localStorage.setItem("bosnia_sticker_trades_wc26", JSON.stringify(updatedOffers));
  };

  const handleRemoveTradeOffer = (id: string) => {
    const targetOffer = tradeOffers.find(o => o.id === id);
    if (targetOffer && targetOffer.ownerAddress === wallet.publicKey) {
      // Re-add offered sticker back to user pouch since they cancelled
      const updated = [...collection];
      const record = updated.find(r => r.stickerId === targetOffer.offeredStickerId);
      if (record) {
        record.count += 1;
      } else {
        updated.push({ stickerId: targetOffer.offeredStickerId, count: 1, pasted: false });
      }
      saveCollection(updated);
    }

    const filtered = tradeOffers.filter(o => o.id !== id);
    setTradeOffers(filtered);
    localStorage.setItem("bosnia_sticker_trades_wc26", JSON.stringify(filtered));
  };

  // Helper selectors
  const pastedCount = collection.filter(c => c.pasted).length;
  const pouchList = collection.filter(c => c.count > 0 && !c.pasted);

  const handleClaimReward = () => {
    if (!wallet.connected) {
      alert(lang === "BS" ? "Povežite virtuelni novčanik da preuzmete nagradu!" : "Please connect your wallet to claim the reward!");
      return;
    }
    setWallet(prev => ({ ...prev, balance: prev.balance + 2.026 }));
    setHasClaimedReward(true);
    localStorage.setItem("bosnia_wc26_reward_claimed", "true");

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.4); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.6); // C6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (_) { }
  };

  return (
    <div className="min-h-screen album-container text-[#1a1a1a] selection:bg-[#FFCD00] selection:text-[#002F6C] pb-16 font-sans">

      {/* Immersive Stadium Top Ambient Ribbon */}
      <div className="bg-gradient-to-r from-[#002F6C] via-[#FFCD00] to-[#002F6C] h-2 w-full shadow-md shrink-0" />

      {/* Main Navbar */}
      <header className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between border-b border-gray-300 gap-4 mb-6">

        {/* Logo / Mascot brand */}
        <div className="flex items-center space-x-4 text-left">
          <div className="w-14 h-14 bg-[#002F6C] rounded-full border-2 border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.7)] flex items-center justify-center overflow-hidden shrink-0">
            <img src={logoImage} alt="Zmajevi BIH Logo" className="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,205,0,0.8)] hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tighter leading-none text-[#002F6C]">
              {UI_TRANSLATIONS[lang].title}
            </h1>
            <p className="text-xs font-serif italic text-gray-500 mt-1">
              {UI_TRANSLATIONS[lang].subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Sound Synthesizer & Solflare stats */}
        <div className="flex flex-wrap items-center gap-3 select-none justify-end w-full md:w-auto">

          {/* Language Switcher Pill */}
          <div className="flex bg-white/80 border border-gray-300 rounded-lg p-0.5 shadow-sm shrink-0">
            <button
              id="lang-switch-bs"
              onClick={() => handleLangChange("BS")}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-black transition-all cursor-pointer ${lang === "BS"
                  ? "bg-[#002F6C] text-white shadow"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
            >
              🇧🇦 BS
            </button>
            <button
              id="lang-switch-en"
              onClick={() => handleLangChange("EN")}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-black transition-all cursor-pointer ${lang === "EN"
                  ? "bg-[#002F6C] text-white shadow"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
            >
              🇬🇧 EN
            </button>
          </div>


          {wallet.connected ? (
            <div className="bg-white border border-gray-300 px-4 py-1 rounded-lg text-left hidden sm:block shadow-sm shrink-0">
              <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">{UI_TRANSLATIONS[lang].connectedAddress}:</span>
              <span className="text-xs font-mono text-[#002F6C] font-black">
                {wallet.publicKey?.substring(0, 6)}...{wallet.publicKey?.substring(wallet.publicKey.length - 6)}
              </span>
            </div>
          ) : (
            <div className="text-right hidden sm:block shrink-0">
              <span className="text-xs font-sans font-bold tracking-widest text-[#002F6C]/60 uppercase">{UI_TRANSLATIONS[lang].walletOffline}</span>
            </div>
          )}

        </div>
      </header>

      {/* Main Core Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Drawer Block - Solana Wallet Connection Area */}
        <div className="lg:col-span-1 space-y-6">
          <SolflareWallet
            wallet={wallet}
            onWalletChange={setWallet}
            lang={lang}
            sandboxMode={sandboxMode}
            onToggleSandbox={() => {
              if (sandboxMode) {
                setSandboxMode(false);
                setWallet({ connected: false, publicKey: null, balance: 0 });
              } else {
                setSandboxMode(true);
                setWallet({ connected: true, publicKey: "SANDBOX...WALLET", balance: 10.0 });
              }
            }}
          />

          {/* Virtual pouch dashboard */}
          <div className="bg-white border border-gray-300/80 p-5 rounded-2xl text-left shadow-sm">
            <h3 className="font-sans font-black text-xs text-[#002F6C] uppercase tracking-wider mb-3 flex items-center space-x-1.5 border-b border-gray-200 pb-2">
              <ShoppingBag className="h-4 w-4 text-[#002F6C]" />
              <span>{UI_TRANSLATIONS[lang].pouchTitle} ({pouchList.reduce((acc, current) => acc + current.count, 0)})</span>
            </h3>

            {pouchList.length === 0 ? (
              <p className="text-xs font-serif text-gray-500 italic py-6 text-center">
                {UI_TRANSLATIONS[lang].pouchEmpty}
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                {pouchList.map((pi) => {
                  const stickerData = STICKERS.find(s => s.id === pi.stickerId);
                  if (!stickerData) return null;
                  return (
                    <button
                      id={`pouch-sticker-token-${pi.stickerId}`}
                      key={pi.stickerId}
                      onClick={() => setSelectedSticker(stickerData)}
                      className="group p-1.5 bg-[#fdfcf7] select-none border border-gray-300 hover:border-[#002F6C] hover:shadow-sm rounded-xl transition flex flex-col items-center justify-between text-center relative aspect-square cursor-pointer"
                    >
                      <span className="font-mono text-[9px] font-bold text-gray-400 block">
                        {stickerData.number}
                      </span>
                      <span className="font-sans font-extrabold text-[10px] text-gray-700 group-hover:text-[#002F6C] block truncate w-full px-0.5">
                        {stickerData.name.split(" ").slice(-1)[0]}
                      </span>
                      {pi.count > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 h-4.5 px-1 rounded-full bg-[#FFCD00] text-[#002F6C] text-[8px] font-mono font-black border border-white shadow">
                          +{pi.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-[10px] font-sans font-bold text-[#002F6C] uppercase mb-1.5 flex items-center justify-between">
                <span>{lang === "BS" ? "Zalijepljene" : "Collected"}</span>
                <span className="bg-[#002F6C] text-white px-1.5 rounded-full">{collection.filter(c => c.pasted).length}/29</span>
              </span>
              <div className="text-[9px] font-sans text-gray-600 leading-relaxed max-h-[90px] overflow-y-auto pr-1 flex flex-wrap gap-1">
                {collection.filter(c => c.pasted).length > 0 ? (
                  collection.filter(c => c.pasted).map(c => STICKERS.find(s => s.id === c.stickerId)).filter(Boolean).map((s) => (
                    <span key={`col-${s!.id}`} className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap shadow-sm">
                      {s!.name.split(" ").slice(-1)[0]}
                    </span>
                  ))
                ) : (
                  <span className="italic">{lang === "BS" ? "Još nema zalijepljenih sličica." : "No pasted stickers yet."}</span>
                )}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-[10px] font-sans font-bold text-[#002F6C] uppercase mb-1.5 flex items-center justify-between">
                <span>{lang === "BS" ? "Duplikati" : "Extras"}</span>
                <span className="bg-[#002F6C] text-white px-1.5 rounded-full">{collection.filter(c => c.count > 0).reduce((acc, c) => acc + c.count, 0)}</span>
              </span>
              <div className="text-[9px] font-sans text-gray-600 leading-relaxed max-h-[90px] overflow-y-auto pr-1 flex flex-wrap gap-1">
                {collection.filter(c => c.count > 0).length > 0 ? (
                  collection.filter(c => c.count > 0).flatMap(c => {
                    const st = STICKERS.find(s => s.id === c.stickerId);
                    if (!st) return [];
                    return Array(c.count).fill(st);
                  }).map((s, idx) => (
                    <span key={`dup-${s.id}-${idx}`} className="bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap shadow-sm text-amber-800">
                      {s.name.split(" ").slice(-1)[0]}
                    </span>
                  ))
                ) : (
                  <span className="italic">{lang === "BS" ? "Nemate duplikata." : "No extra cards."}</span>
                )}
              </div>
            </div>
          </div>

          {/* Golden Era Trophy Box widget */}
          <div className="bg-[#fffef8] border border-dashed border-gray-400/80 p-5 rounded-2xl text-left hidden lg:block shadow-sm">
            <h4 className="text-xs font-sans text-[#002F6C] font-bold uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Star className="h-4 w-4 text-[#FFCD00]" />
              <span>{UI_TRANSLATIONS[lang].mandateTitle}</span>
            </h4>
            <p className="text-xs font-serif text-gray-600 leading-relaxed italic">
              {UI_TRANSLATIONS[lang].mandateDesc}
            </p>
          </div>
        </div>

        {/* Center / Right Multi-View Workspace (Pages, Shop, Trade) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Dynamic Switch Tabs */}
          <div className="flex flex-nowrap overflow-x-auto scrollbar-hide snap-x gap-1.5 bg-[#e8e5d8] p-1.5 rounded-xl border border-gray-300 text-sm font-sans font-bold [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              id="tab-open-album-book"
              onClick={() => setActiveTab("album")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[125px] ${activeTab === "album" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
                }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span>{UI_TRANSLATIONS[lang].tabAlbum}</span>
            </button>

            <button
              id="tab-open-pack-opener"
              onClick={() => setActiveTab("packs")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[120px] ${activeTab === "packs" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
                }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>{UI_TRANSLATIONS[lang].tabPacks}</span>
            </button>

            <button
              id="tab-open-trade-market"
              onClick={() => setActiveTab("trades")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[130px] ${activeTab === "trades" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
                }`}
            >
              <ArrowLeftRight className="h-4.5 w-4.5" />
              <span>{UI_TRANSLATIONS[lang].tabTrades}</span>
            </button>



            <button
              id="tab-open-history"
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[120px] ${activeTab === "history" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-[#002F6C]"
                }`}
            >
              <Trophy className="h-4.5 w-4.5 text-[#FFCD00]" />
              <span>{UI_TRANSLATIONS[lang].tabHistory}</span>
            </button>
          </div>

          {/* --- VIEWS --- */}
          <div className="min-h-[460px]">
            {activeTab === "album" && (
              <AlbumPage
                collection={collection}
                onViewSticker={setSelectedSticker}
                pastedCount={pastedCount}
                lang={lang}
                walletConnected={wallet.connected}
                hasClaimedReward={hasClaimedReward}
                onClaimReward={handleClaimReward}
                sandboxMode={sandboxMode}
              />
            )}

            {activeTab === "packs" && (
              <PackOpener
                wallet={wallet}
                onWalletChange={setWallet}
                onAddStickers={handleAddStickers}
                onViewSticker={setSelectedSticker}
                lang={lang}
                sandboxMode={sandboxMode}
              />
            )}

            {activeTab === "trades" && (
              <TradeMarket
                wallet={wallet}
                onWalletChange={setWallet}
                collection={collection}
                onTradeCompleted={handleTradeCompleted}
                onSelfTradePosted={handleSelfTradePosted}
                tradeOffers={tradeOffers}
                onRemoveTradeOffer={handleRemoveTradeOffer}
                lang={lang}
                sandboxMode={sandboxMode}
              />
            )}



            {activeTab === "history" && (
              <HistoryPage lang={lang} />
            )}
          </div>

        </div>
      </main>

      {/* ================= 600px x 700px DETAILED STICKER MODAL ================= */}
      {selectedSticker && (
        <CardDetail
          sticker={selectedSticker}
          userSticker={collection.find(c => c.stickerId === selectedSticker.id)}
          onClose={() => setSelectedSticker(null)}
          onPaste={handlePasteStickerInAlbum}
          walletConnected={wallet.connected}
          lang={lang}
          mintedStickers={mintedStickers}
          onMintSticker={handleRegisterMint}
          sandboxMode={sandboxMode}
        />
      )}

      {/* ================= IN-APP WELCOME INSTRUCTIONS ONBOARDING ================= */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm">
          <div className="bg-[#fffef8] border-4 border-[#00f0ff] rounded-3xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-[0_0_25px_rgba(0,240,255,0.7)] text-gray-800">
            <div className="w-20 h-20 bg-[#002F6C] border-2 border-[#00f0ff] rounded-full flex items-center justify-center overflow-hidden shrink-0 mx-auto shadow-[0_0_12px_rgba(0,240,255,0.5)]">
              <img src={logoImage} alt="Zmajevi Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-sans font-bold text-gray-400 tracking-[0.3em] uppercase block">
                {UI_TRANSLATIONS[lang].welcomeTitle}
              </span>
              <h2 className="text-3xl font-sans font-black tracking-tight text-[#002F6C] uppercase leading-none">
                {UI_TRANSLATIONS[lang].welcomeHeader}
              </h2>
              <div className="h-0.5 w-1/3 bg-[#FFCD00] mx-auto" />
            </div>

            <div className="text-gray-750 text-sm leading-relaxed space-y-3 font-serif">
              <p>
                {UI_TRANSLATIONS[lang].welcomeText1}<strong>5.0 Simulated SOL</strong>{UI_TRANSLATIONS[lang].welcomeText2}<strong>4 starting stickers</strong>{UI_TRANSLATIONS[lang].welcomeText3}
              </p>
              <ul className="text-left bg-white border border-gray-300 p-4 rounded-xl space-y-2 text-xs font-sans list-none">
                <li className="flex items-center space-x-2 text-gray-800">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#002F6C] shrink-0" />
                  <span>{UI_TRANSLATIONS[lang].starterKit1}</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-800">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#002F6C] shrink-0" />
                  <span>{UI_TRANSLATIONS[lang].starterKit2}</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-800">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#002F6C] shrink-0" />
                  <span>{UI_TRANSLATIONS[lang].starterKit3}</span>
                </li>
              </ul>
            </div>

            <button
              id="btn-confirm-welcome-onboard"
              onClick={() => {
                setShowWelcome(false);
              }}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black tracking-wide text-sm transition shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer font-sans"
            >
              {UI_TRANSLATIONS[lang].starterKitButton}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
