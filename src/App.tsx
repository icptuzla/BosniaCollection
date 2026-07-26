import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Coins, ShoppingBag, ArrowLeftRight, Volume2, VolumeX, Award, HelpCircle, BadgeCheck, CheckCircle2, Star, Trophy } from "lucide-react";
import { Sticker, UserSticker, TradeOffer, WalletState, StickerType } from "./types";
import { STICKERS } from "./data/players";
import logoImage from "./components/zmajevi logo.webp";
import { UI_TRANSLATIONS, Language } from "./data/translations";

// Import custom sub-components
import SolflareWallet from "./components/SolflareWallet";
import AlbumPage from "./components/AlbumPage";
import PackOpener from "./components/PackOpener";
import TradeMarket from "./components/TradeMarket";
import CardDetail from "./components/CardDetail";
import MatchBets from "./components/MatchBets";
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

  const [activeTab, setActiveTab] = useState<"album" | "pouch" | "packs" | "trades" | "bets" | "history">("album");
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    isSimulated: true,
  });

  const [collection, setCollection] = useState<UserSticker[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [ambientNode, setAmbientNode] = useState<BiquadFilterNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
  const toggleSound = () => {
    if (soundEnabled) {
      // Mute
      if (ambientNode) {
        try {
          ambientNode.disconnect();
        } catch (_) {}
      }
      setSoundEnabled(false);
    } else {
      // Unmute & Build Arena Crowd Sound Synthesizer!
      try {
        const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        setAudioContext(ctx);

        // Brown noise simulation for heavy stadium wind/cheers
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 4.5; // Gain compensation
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass sweeps to make it sound like dynamic crowd singing chants
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 260; // low frequency hum of deep chants
        bandpass.Q.value = 4.0;

        // Lowpass to make it muffled
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 350;

        const volume = ctx.createGain();
        volume.gain.value = 0.08; // subtle backgound whisper

        whiteNoise.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(volume);
        volume.connect(ctx.destination);

        whiteNoise.start();

        setAmbientNode(lowpass); // Keep reference to shut down
        setSoundEnabled(true);
      } catch (e) {
        console.warn("Audio Context init blocked:", e);
      }
    }
  };

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

      // Synthesize slap paper adhesive sound effect
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const noise = ctx.createBufferSource();
        
        // Short friction rumble
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buf;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 180;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        noise.connect(lowpass);
        lowpass.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start();
        noise.stop(ctx.currentTime + 0.12);
      } catch (_) {}

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

  return (
    <div className="album-container min-h-screen font-sans selection:bg-gold selection:text-base pb-16">
      
      {/* Subtle gold accent line (replaces the old gradient ribbon) */}
      <div className="h-px w-full bg-gold/10 shrink-0" />

      {/* Main Navbar */}
      <header className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between border-b border-border gap-4 mb-6">
        
        {/* Logo / Mascot brand */}
        <div className="flex items-center space-x-4 text-left">
          <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center overflow-hidden shrink-0 bg-surface-2">
            <img src={logoImage} alt="Zmajevi BIH Logo" className="w-12 h-12 object-contain hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="font-sans font-black text-xl sm:text-2xl uppercase tracking-tighter leading-none text-text">
              {UI_TRANSLATIONS[lang].title}
            </h1>
            <p className="text-xs font-sans text-text-muted mt-1">
              {UI_TRANSLATIONS[lang].subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Sound Synthesizer & Solflare stats */}
        <div className="flex flex-wrap items-center gap-3 select-none justify-end w-full md:w-auto">
          
          {/* Language Switcher Pill */}
          <div className="flex bg-surface-2 border border-border rounded-lg p-0.5 shrink-0">
            <button
              id="lang-switch-bs"
              onClick={() => handleLangChange("BS")}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-bold transition-all cursor-pointer ${
                lang === "BS"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text hover:bg-surface-3"
              }`}
            >
              🇧🇦 BS
            </button>
            <button
              id="lang-switch-en"
              onClick={() => handleLangChange("EN")}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-bold transition-all cursor-pointer ${
                lang === "EN"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text hover:bg-surface-3"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          {/* Sound Synthesizer hummer */}
          <button
            id="btn-arena-chants-ambient"
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs font-sans font-semibold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              soundEnabled
                ? "bg-surface-2 border-border text-text"
                : "bg-surface-2 border-border text-text-muted hover:text-text hover:bg-surface-3"
            }`}
            title="Toggle Synthesized Stadium Crowd Humming Chants"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{UI_TRANSLATIONS[lang].arenaHum}</span>
          </button>

          {wallet.connected ? (
            <div className="bg-surface-2 border border-border px-4 py-1 rounded-lg text-left hidden sm:block shrink-0">
              <span className="text-[11px] font-sans font-bold text-text-muted block uppercase leading-none">{UI_TRANSLATIONS[lang].connectedAddress}:</span>
              <span className="text-xs font-mono text-success font-bold">
                {wallet.publicKey?.substring(0, 6)}...{wallet.publicKey?.substring(wallet.publicKey.length - 6)}
              </span>
            </div>
          ) : (
            <div className="text-right hidden sm:block shrink-0">
              <span className="text-xs font-sans font-bold tracking-widest text-text-muted uppercase">{UI_TRANSLATIONS[lang].walletOffline}</span>
            </div>
          )}

        </div>
      </header>

      {/* Main Core Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Drawer Block - Solana Wallet Connection Area */}
        <div className="lg:col-span-1 space-y-6">
          <SolflareWallet wallet={wallet} onWalletChange={setWallet} lang={lang} />
          
          {/* Virtual pouch dashboard */}
          <div className="bg-surface border border-border p-5 rounded-2xl text-left">
            <h3 className="font-sans font-bold text-xs text-text uppercase tracking-wider mb-3 flex items-center space-x-1.5 border-b border-border pb-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>{UI_TRANSLATIONS[lang].pouchTitle} ({pouchList.reduce((acc, current) => acc + current.count, 0)})</span>
            </h3>

            {pouchList.length === 0 ? (
              <p className="text-xs font-sans text-text-muted py-6 text-center">
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
                      className="group p-1.5 bg-surface-2 select-none border border-border hover:border-border-hover hover:bg-surface-3 rounded-xl transition flex flex-col items-center justify-between text-center relative aspect-square cursor-pointer"
                    >
                      <span className="font-mono text-[11px] font-bold text-text-muted block">
                        {stickerData.number}
                      </span>
                      <span className="font-sans font-bold text-[11px] text-text group-hover:text-gold block truncate w-full px-0.5">
                        {stickerData.name.split(" ").slice(-1)[0]}
                      </span>
                      {pi.count > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gold text-base text-[11px] font-mono font-black border border-base">
                          +{pi.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            <p className="text-[11px] font-sans text-text-muted leading-relaxed mt-3 pt-3 border-t border-border">
              {UI_TRANSLATIONS[lang].pouchInstructions}
            </p>
          </div>

          {/* Golden Era Trophy Box widget */}
          <div className="bg-surface-2 border border-gold/20 p-5 rounded-2xl text-left hidden lg:block">
            <h4 className="text-xs font-sans text-gold font-bold uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Star className="h-4 w-4 text-gold" />
              <span>{UI_TRANSLATIONS[lang].mandateTitle}</span>
            </h4>
            <p className="text-xs font-sans text-text-muted leading-relaxed">
              {UI_TRANSLATIONS[lang].mandateDesc}
            </p>
          </div>
        </div>

        {/* Center / Right Multi-View Workspace (Pages, Shop, Trade) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Dynamic Switch Tabs */}
          <div className="flex flex-wrap md:flex-nowrap gap-1 bg-surface-2/50 p-1.5 rounded-xl border border-border text-sm font-sans font-bold">
            <button
              id="tab-open-album-book"
              onClick={() => setActiveTab("album")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[125px] ${
                activeTab === "album" ? "bg-primary text-white font-bold" : "text-text-muted hover:text-text hover:bg-surface-2 font-semibold"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{UI_TRANSLATIONS[lang].tabAlbum}</span>
            </button>

            <button
              id="tab-open-pack-opener"
              onClick={() => setActiveTab("packs")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[120px] ${
                activeTab === "packs" ? "bg-primary text-white font-bold" : "text-text-muted hover:text-text hover:bg-surface-2 font-semibold"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{UI_TRANSLATIONS[lang].tabPacks}</span>
            </button>

            <button
              id="tab-open-trade-market"
              onClick={() => setActiveTab("trades")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[130px] ${
                activeTab === "trades" ? "bg-primary text-white font-bold" : "text-text-muted hover:text-text hover:bg-surface-2 font-semibold"
              }`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>{UI_TRANSLATIONS[lang].tabTrades}</span>
            </button>

            <button
              id="tab-open-prediction-arena"
              onClick={() => setActiveTab("bets")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[125px] ${
                activeTab === "bets" ? "bg-primary text-white font-bold" : "text-text-muted hover:text-text hover:bg-surface-2 font-semibold"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>{UI_TRANSLATIONS[lang].tabPredictions}</span>
            </button>

            <button
              id="tab-open-history"
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer font-sans uppercase text-xs tracking-wider min-w-[120px] ${
                activeTab === "history" ? "bg-primary text-white font-bold" : "text-text-muted hover:text-text hover:bg-surface-2 font-semibold"
              }`}
            >
              <Trophy className="h-4 w-4 text-gold" />
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
              />
            )}

            {activeTab === "packs" && (
              <PackOpener
                wallet={wallet}
                onWalletChange={setWallet}
                onAddStickers={handleAddStickers}
                onViewSticker={setSelectedSticker}
                lang={lang}
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
              />
            )}

            {activeTab === "bets" && (
              <MatchBets
                wallet={wallet}
                onWalletChange={setWallet}
                collection={collection}
                onCollectionChange={saveCollection}
                lang={lang}
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
        />
      )}

      {/* ================= IN-APP WELCOME INSTRUCTIONS ONBOARDING ================= */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-2 border border-gold/30 rounded-2xl p-6 md:p-8 max-w-lg w-full text-center space-y-6 shadow-lg shadow-black/40 text-text">
            <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center overflow-hidden shrink-0 mx-auto bg-surface">
              <img src={logoImage} alt="Zmajevi Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-sans font-bold text-text-muted tracking-[0.3em] uppercase block">
                {UI_TRANSLATIONS[lang].welcomeTitle}
              </span>
              <h2 className="text-3xl font-sans font-black tracking-tight text-text uppercase leading-none">
                {UI_TRANSLATIONS[lang].welcomeHeader}
              </h2>
              <div className="h-0.5 w-1/3 bg-gold mx-auto" />
            </div>

            <div className="text-text text-sm leading-relaxed space-y-3 font-sans">
              <p>
                {UI_TRANSLATIONS[lang].welcomeText1}<strong>5.0 Simulated SOL</strong>{UI_TRANSLATIONS[lang].welcomeText2}<strong>4 starting stickers</strong>{UI_TRANSLATIONS[lang].welcomeText3}
              </p>
              <ul className="text-left bg-surface border border-border p-4 rounded-xl space-y-2 text-xs font-sans list-none">
                <li className="flex items-center space-x-2 text-text">
                  <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>{UI_TRANSLATIONS[lang].starterKit1}</span>
                </li>
                <li className="flex items-center space-x-2 text-text">
                  <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>{UI_TRANSLATIONS[lang].starterKit2}</span>
                </li>
                <li className="flex items-center space-x-2 text-text">
                  <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>{UI_TRANSLATIONS[lang].starterKit3}</span>
                </li>
              </ul>
            </div>

            <button
              id="btn-confirm-welcome-onboard"
              onClick={() => {
                setShowWelcome(false);
                // Connect simulated sandbox wallet immediately to minimize friction
                setWallet({ connected: true, publicKey: "SolfZmaj99InitialTestAddressFmC26", balance: 5.0, isSimulated: true });
              }}
              className="w-full py-3 px-6 rounded-xl bg-gold hover:bg-gold-hover text-base font-bold tracking-wide text-sm transition cursor-pointer font-sans"
            >
              {UI_TRANSLATIONS[lang].starterKitButton}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
