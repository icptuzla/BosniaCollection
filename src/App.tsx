import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Coins, ShoppingBag, ArrowLeftRight, Volume2, VolumeX, Award, HelpCircle, BadgeCheck, CheckCircle2, Star, Trophy } from "lucide-react";
import { Sticker, UserSticker, TradeOffer, WalletState, StickerType } from "./types";
import { STICKERS } from "./data/players";
import logoImage from "./components/zmajevi logo.png";

// Import custom sub-components
import SolflareWallet from "./components/SolflareWallet";
import AlbumPage from "./components/AlbumPage";
import PackOpener from "./components/PackOpener";
import TradeMarket from "./components/TradeMarket";
import CardDetail from "./components/CardDetail";
import MatchBets from "./components/MatchBets";

export default function App() {
  // --- STATE SYSTEM ---
  const [activeTab, setActiveTab] = useState<"album" | "pouch" | "packs" | "trades" | "bets">("album");
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
        { stickerId: 1, count: 1, pasted: true }, // Edin Džeko (pasted)
        { stickerId: 2, count: 1, pasted: true }, // Ermedin Demirović (pasted)
        { stickerId: 23, count: 1, pasted: true }, // Golden Crest (pasted)
        { stickerId: 7, count: 2, pasted: false }, // Hadžikadunić (Has 2 duplicates, unpasted)
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
          id: "tx-trd-pjanic-demirovic",
          ownerAddress: "SolfP2Pm88SarajevoXyZ",
          ownerName: "SarajevoCollector_99",
          offeredStickerId: 3, // Miralem Pjanić
          requestedStickerId: 2, // Demirović
          status: "OPEN",
          createdAt: Date.now() - 3600000,
        },
        {
          id: "tx-trd-bilino-sol",
          ownerAddress: "SolfZenicaStadiumHost",
          ownerName: "Zenica_Tornado_88",
          offeredStickerId: 24, // Stadion Bilino Polje (Special)
          requestedStickerId: -1, // Selling for SOL
          solPrice: 1.5,
          status: "OPEN",
          createdAt: Date.now() - 7200000,
        },
        {
          id: "tx-trd-bajraktarevic-tabakovic",
          ownerAddress: "SolfDiasporaBosnjak",
          ownerName: "BHFanatic_Tuzla",
          offeredStickerId: 19, // Esmir Bajraktarević
          requestedStickerId: 21, // Haris Tabaković
          status: "OPEN",
          createdAt: Date.now() - 200000,
        },
        {
          id: "tx-trd-dedic-kolasinac",
          ownerAddress: "SolfSalzburgFanatic",
          ownerName: "Amar_D_Zmaj",
          offeredStickerId: 5, // Amar Dedić
          requestedStickerId: 4, // Kolašinac
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
            <h1 className="font-sans font-black text-2xl uppercase tracking-tighter leading-none text-[#002F6C]">
              Zmajevi 2026
            </h1>
            <p className="text-xs font-serif italic text-gray-500">
              Official Collector's Web3 Sticker Album
            </p>
          </div>
        </div>

        {/* Dynamic Sound Synthesizer & Solflare stats */}
        <div className="flex items-center space-x-4 select-none shrink-0 w-full md:w-auto justify-end">
          
          {/* Sound Synthesizer hummer */}
          <button
            id="btn-arena-chants-ambient"
            onClick={toggleSound}
            className={`p-2.5 rounded-lg border text-xs font-sans font-semibold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
              soundEnabled
                ? "bg-[#002F6C]/10 border-[#002F6C] text-[#002F6C] shadow-sm animate-pulse"
                : "bg-white/80 border-gray-300 text-gray-500 hover:text-gray-700"
            }`}
            title="Toggle Synthesized Stadium Crowd Humming Chants"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">Arena Hum</span>
          </button>

          {wallet.connected ? (
            <div className="bg-white border border-gray-300 px-4 py-1.5 rounded-lg text-left hidden sm:block shadow-sm">
              <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">CONNECTED ADDRESS:</span>
              <span className="text-xs font-mono text-[#002F6C] font-black">
                {wallet.publicKey?.substring(0, 6)}...{wallet.publicKey?.substring(wallet.publicKey.length - 6)}
              </span>
            </div>
          ) : (
            <div className="text-right hidden sm:block">
              <span className="text-xs font-sans font-bold tracking-widest text-[#002F6C]/60 uppercase">Wallet Offline</span>
            </div>
          )}

        </div>
      </header>

      {/* Main Core Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Drawer Block - Solana Wallet Connection Area */}
        <div className="lg:col-span-1 space-y-6">
          <SolflareWallet wallet={wallet} onWalletChange={setWallet} />
          
          {/* Virtual pouch dashboard */}
          <div className="bg-white border border-gray-300/80 p-5 rounded-2xl text-left shadow-sm">
            <h3 className="font-sans font-black text-xs text-[#002F6C] uppercase tracking-wider mb-3 flex items-center space-x-1.5 border-b border-gray-200 pb-2">
              <ShoppingBag className="h-4 w-4 text-[#002F6C]" />
              <span>Pouch Unmounted Stickers ({pouchList.reduce((acc, current) => acc + current.count, 0)})</span>
            </h3>

            {pouchList.length === 0 ? (
              <p className="text-xs font-serif text-gray-500 italic py-6 text-center">
                Your pouch is currently empty. Buy sticker packs to collect players!
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
            
            <p className="text-[10px] font-sans text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-200">
              * Click any card in your unmounted pouch to flip open its full 600x700 stat block, detail metrics, and paste it directly into its album page slot.
            </p>
          </div>

          {/* Golden Era Trophy Box widget */}
          <div className="bg-[#fffef8] border border-dashed border-gray-400/80 p-5 rounded-2xl text-left hidden lg:block shadow-sm">
            <h4 className="text-xs font-sans text-[#002F6C] font-bold uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Star className="h-4 w-4 text-[#FFCD00]" />
              <span>Special Album Mandate</span>
            </h4>
            <p className="text-xs font-serif text-gray-600 leading-relaxed italic">
              Complete the legendary 22-man Bosnian selection and find the 4 "Special Collectibles" (Golden Crest, Estadio Zenica, Generacija 2014, BHFanaticos) to get your verified Metaplex golden certificate of completion!
            </p>
          </div>
        </div>

        {/* Center / Right Multi-View Workspace (Pages, Shop, Trade) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Dynamic Switch Tabs */}
          <div className="flex bg-[#e8e5d8] p-1.5 rounded-xl border border-gray-300 text-sm font-sans font-bold">
            <button
              id="tab-open-album-book"
              onClick={() => setActiveTab("album")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider ${
                activeTab === "album" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span>Bosnian Album Book</span>
            </button>

            <button
              id="tab-open-pack-opener"
              onClick={() => setActiveTab("packs")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider ${
                activeTab === "packs" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Rip Booster Packs</span>
            </button>

            <button
              id="tab-open-trade-market"
              onClick={() => setActiveTab("trades")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider ${
                activeTab === "trades" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
              }`}
            >
              <ArrowLeftRight className="h-4.5 w-4.5" />
              <span>Solana Swap Center</span>
            </button>

            <button
              id="tab-open-prediction-arena"
              onClick={() => setActiveTab("bets")}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer font-sans uppercase text-xs tracking-wider ${
                activeTab === "bets" ? "bg-[#002F6C] text-white font-extrabold shadow-md" : "text-gray-600 hover:text-gray-950"
              }`}
            >
              <Trophy className="h-4.5 w-4.5" />
              <span>Prediction Arena</span>
            </button>
          </div>

          {/* --- VIEWS --- */}
          <div className="min-h-[460px]">
            {activeTab === "album" && (
              <AlbumPage
                collection={collection}
                onViewSticker={setSelectedSticker}
                pastedCount={pastedCount}
              />
            )}

            {activeTab === "packs" && (
              <PackOpener
                wallet={wallet}
                onWalletChange={setWallet}
                onAddStickers={handleAddStickers}
                onViewSticker={setSelectedSticker}
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
              />
            )}

            {activeTab === "bets" && (
              <MatchBets
                wallet={wallet}
                onWalletChange={setWallet}
                collection={collection}
                onCollectionChange={saveCollection}
              />
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
              <span className="text-[10px] font-sans font-bold text-gray-400 tracking-[0.3em] uppercase block">WELCOME COLLECTOR</span>
              <h2 className="text-3xl font-sans font-black tracking-tight text-[#002F6C] uppercase leading-none">
                ZMAJEVI 2026 ALBUM
              </h2>
              <div className="h-0.5 w-1/3 bg-[#FFCD00] mx-auto" />
            </div>

            <div className="text-gray-750 text-sm leading-relaxed space-y-3 font-serif">
              <p>
                We have credited your virtual tray with <strong>5.0 Simulated SOL</strong> in your sandbox wallet and placed <strong>4 starting stickers</strong> in your portfolio to begin.
              </p>
              <ul className="text-left bg-white border border-gray-300 p-4 rounded-xl space-y-2 text-xs font-sans list-none">
                <li className="flex items-center space-x-2 text-gray-800">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#002F6C] shrink-0" />
                  <span>Edin Džeko & Ermedin Demirović already mounted!</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-800">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#002F6C] shrink-0" />
                  <span>Holographic Golden Crest (S1) mounted!</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-800">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#002F6C] shrink-0" />
                  <span>Duplicate Dennis Hadžikadunić added to your pouch!</span>
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
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black tracking-wide text-sm transition shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer font-sans"
            >
              Claim Starter Kit & Open Album
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
