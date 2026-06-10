import React, { useState, useEffect } from "react";
import { Play, Shield, Calendar, Clock, MapPin, Award, Lock, HelpCircle, Trophy, Sparkles, CheckCircle2, AlertTriangle, Users, BookOpen } from "lucide-react";
import { Sticker, UserSticker, WalletState, StickerType } from "../types";
import { STICKERS } from "../data/players";

interface MatchBetsProps {
  wallet: WalletState;
  onWalletChange: (w: WalletState) => void;
  collection: UserSticker[];
  onCollectionChange: (newCollection: UserSticker[]) => void;
}

interface Match {
  id: string;
  opponent: string;
  opponentFlag: string;
  opponentCrestTheme: string;
  timestamp: string;
  stadium: string;
  city: string;
  stage: string;
  defaultOdds: string;
  squadIds: number[]; // Player IDs matching STICKERS
}

interface Bet {
  id: string;
  matchId: string;
  predHomeGoals: number;
  predAwayGoals: number;
  betStickerId: number;
  status: "ACTIVE" | "WON" | "LOST";
  actualHomeGoals?: number;
  actualAwayGoals?: number;
  createdAt: number;
}

const UPCOMING_MATCHES: Match[] = [
  {
    id: "match-wc26-germany",
    opponent: "Germany",
    opponentFlag: "🇩🇪",
    opponentCrestTheme: "from-black via-red-600 to-yellow-500",
    timestamp: "June 15, 2026 - 21:00 CEST",
    stadium: "Munich Football Arena",
    city: "Munich, Germany",
    stage: "Group Stage - Matchday 1",
    defaultOdds: "Germany (1.45) | Draw (4.20) | Bosnia (6.80)",
    squadIds: [12, 5, 6, 7, 4, 9, 8, 11, 3, 2, 1], // Vasilj, Dedić, Ahmedhodžić, Hadžikadunić, Kolašinac, Gazibegović, Tahirović, Krunić, Pjanić, Demirović, Džeko
  },
  {
    id: "match-wc26-mexico",
    opponent: "Mexico",
    opponentFlag: "🇲🇽",
    opponentCrestTheme: "from-green-700 via-white to-red-600",
    timestamp: "June 20, 2026 - 18:00 CEST",
    stadium: "Estadio Azteca",
    city: "Mexico City, Mexico",
    stage: "Group Stage - Matchday 2",
    defaultOdds: "Mexico (2.10) | Draw (3.40) | Bosnia (3.10)",
    squadIds: [13, 9, 14, 15, 4, 22, 16, 17, 18, 21, 2], // Pirić, Gazibegović, Bičakčić, Barišić, Kolašinac, Omerović, Gigović, Burnić, Bašić, Tabaković, Demirović
  },
  {
    id: "match-wc26-japan",
    opponent: "Japan",
    opponentFlag: "🇯🇵",
    opponentCrestTheme: "from-blue-900 via-white to-red-500",
    timestamp: "June 25, 2026 - 15:00 CEST",
    stadium: "SoFi Stadium",
    city: "Los Angeles, USA",
    stage: "Group Stage - Matchday 3",
    defaultOdds: "Japan (1.95) | Draw (3.50) | Bosnia (3.60)",
    squadIds: [12, 5, 6, 4, 9, 8, 11, 3, 10, 19, 1], // Vasilj, Dedić, Ahmedhodžić, Kolašinac, Gazibegović, Tahirović, Krunić, Pjanić, Hajradinović, Bajraktarević, Džeko
  }
];

export default function MatchBets({ wallet, onWalletChange, collection, onCollectionChange }: MatchBetsProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match>(UPCOMING_MATCHES[0]);
  const [predHome, setPredHome] = useState<number>(2);
  const [predAway, setPredAway] = useState<number>(1);
  const [betStickerId, setBetStickerId] = useState<number>(-1);
  const [bets, setBets] = useState<Bet[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulation Ticker State
  const [simulatingBetId, setSimulatingBetId] = useState<string | null>(null);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [simFinalResult, setSimFinalResult] = useState<{ home: number; away: number } | null>(null);

  useEffect(() => {
    const savedBets = localStorage.getItem("bosnia_wc26_match_bets");
    if (savedBets) {
      setBets(JSON.parse(savedBets));
    }
  }, []);

  const saveBetsList = (newBets: Bet[]) => {
    setBets(newBets);
    localStorage.setItem("bosnia_wc26_match_bets", JSON.stringify(newBets));
  };

  // Extract all unpasted duplicate cards from pouch
  const bettableStickers = collection.filter(c => c.count > 0 && !c.pasted).map(c => {
    const orig = STICKERS.find(s => s.id === c.stickerId);
    return {
      ...c,
      player: orig
    };
  }).filter(item => item.player !== undefined);

  // Handle Placing a Bet
  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!wallet.connected) {
      setErrorMsg("Please connect your Solflare mock wallet first to confirm Metaplex asset lock!");
      return;
    }

    if (betStickerId === -1) {
      setErrorMsg("Please select a physical unpasted sticker from your pouch to serve as escrow collateral!");
      return;
    }

    // Double check collection is available and sticker exists
    const record = collection.find(c => c.stickerId === betStickerId);
    if (!record || record.count <= 0 || record.pasted) {
      setErrorMsg("Sticker is no longer available in your pouch!");
      return;
    }

    // Deduct 1 sticker from portfolio
    const updatedCollection = collection.map(c => {
      if (c.stickerId === betStickerId) {
        return { ...c, count: c.count - 1 };
      }
      return c;
    }).filter(c => c.count > 0 || c.pasted);

    onCollectionChange(updatedCollection);

    // Create Bet Object
    const newBet: Bet = {
      id: "bet-" + Math.random().toString(36).substr(2, 9),
      matchId: selectedMatch.id,
      predHomeGoals: predHome,
      predAwayGoals: predAway,
      betStickerId: betStickerId,
      status: "ACTIVE",
      createdAt: Date.now()
    };

    const newBetsList = [newBet, ...bets];
    saveBetsList(newBetsList);

    // Audio sound for slot lock
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (_) {}

    const selectedPlayer = STICKERS.find(s => s.id === betStickerId);
    setSuccessMsg(`✓ Bet placed! Locked ${selectedPlayer?.name} (MINT ID: B-WC26-${betStickerId}) in Metaplex Escrow Contract. Predicted score: BIH ${predHome} - ${predAway} ${selectedMatch.opponent}`);
    setBetStickerId(-1);
  };

  // Interactive Live matchday Simulation Resolver
  const startSimulation = (bet: Bet) => {
    if (simulatingBetId) return;

    setSimProgress(0);
    setSimulatingBetId(bet.id);
    setSimFinalResult(null);

    const targetMatch = UPCOMING_MATCHES.find(m => m.id === bet.matchId);
    if (!targetMatch) return;

    // Standard football live commentary simulation events
    const minutes = [10, 24, 45, 62, 78, 90];
    const eventsPool = [
      "Edin Džeko wins a powerful air battle! He hits the post!",
      `Miralem Pjanić launches a brilliant curved free kick! Perfect curl but keeper saves!`,
      "Ermedin Demirović gets a yellow card after a robust tackle.",
      "The Bosnian BHFanaticos fans are lighting flares, creating a wall of golden heat support!",
      `${targetMatch.opponent} triggers a dangerous counter-attack from the flank, blocked by Kolašinac!`,
      `Benjamin Tahirović releases a high-speed through-ball to the box.`,
      "Amar Dedić sprints down the wing and whipped an amazing cross!"
    ];

    let currentHomeGoals = 0;
    let currentAwayGoals = 0;

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + 1;
        
        let logText = "";
        
        if (next === 1) {
          logText = `⏱️ 1' Kickoff! Match begins at ${targetMatch.stadium}. Zmajevi are in their blue & gold armor!`;
          setSimLog([logText]);
        } else if (next === 2) {
          logText = `⏱️ 22' Chance for Bosnia! ${eventsPool[Math.floor(Math.random() * eventsPool.length)]}`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 3) {
          // Score 1st goal
          if (Math.random() > 0.4) {
            currentHomeGoals += 1;
            logText = `⚽ 41' Goal!!! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}! Edin Džeko converts a spectacular header into the bottom corner! Stadium erupts!`;
          } else {
            currentAwayGoals += 1;
            logText = `⚽ 38' Goal for ${targetMatch.opponent}! ${targetMatch.opponent} ${currentAwayGoals} - ${currentHomeGoals} BIH. A deflected shot catches Vasilj off-guard.`;
          }
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 4) {
          logText = `⏱️ 45+2' Half-time whistle blown. Managers tactical adjustments incoming. ${targetMatch.defaultOdds}`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 5) {
          logText = `⏱️ 67' ${eventsPool[Math.floor(Math.random() * eventsPool.length)]}`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 6) {
          // Final goal resolution trigger to make score generation interesting
          if (Math.random() > 0.5) {
            currentHomeGoals += 1;
            logText = `⚽ 81' GOAAAL!!! Ermedin Demirović receives a sleek backheel assist from Miralem Pjanić and bangs it in! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}!`;
          } else if (Math.random() > 0.6) {
            currentAwayGoals += 1;
            logText = `⚽ 85' Goal for ${targetMatch.opponent}! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}. Perfect close-range strike.`;
          } else {
            logText = `⏱️ 88' Tense final minutes! Bosnia's wall is repelling corner kicks after corner kicks!`;
          }
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 7) {
          // Final whistle
          logText = `🏁 90' Full-time! Final score: BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}. Celebrating sportsmanship in the true spirit of World Cup 2026.`;
          setSimLog(prevLogs => [...prevLogs, logText]);
          setSimFinalResult({ home: currentHomeGoals, away: currentAwayGoals });
          clearInterval(interval);
        }

        return next;
      });
    }, 1200);
  };

  // Claim simulation payouts
  const claimBetReward = (bet: Bet, index: number) => {
    if (!simFinalResult) return;

    const won = (bet.predHomeGoals === simFinalResult.home) && (bet.predAwayGoals === simFinalResult.away);
    const updatedBets = [...bets];
    
    // Play sound effects
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = won ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(won ? 523.25 : 150, audioCtx.currentTime); // High C note or low buzzer
      if (won) {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
      }
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch (_) {}

    if (won) {
      // Return the card with 1 extra duplication block as a prize!
      const updatedCollection = [...collection];
      const matchRec = updatedCollection.find(c => c.stickerId === bet.betStickerId);
      if (matchRec) {
        // give back locked card and award an extra duplicate!
        matchRec.count += 2; 
      } else {
        updatedCollection.push({ stickerId: bet.betStickerId, count: 2, pasted: false });
      }
      onCollectionChange(updatedCollection);

      // Award 2.0 SOL prize to wallet
      onWalletChange({
        ...wallet,
        balance: Number((wallet.balance + 2.0).toFixed(2))
      });

      updatedBets[index] = {
        ...bet,
        status: "WON",
        actualHomeGoals: simFinalResult.home,
        actualAwayGoals: simFinalResult.away
      };
      
      alert(`🎉 Congratulations! Your prediction was exact! Escrow released containing your locked card plus 1 bonus duplicate card and 2.0 SOL jackpot!`);
    } else {
      // The locked card is lost permanently
      updatedBets[index] = {
        ...bet,
        status: "LOST",
        actualHomeGoals: simFinalResult.home,
        actualAwayGoals: simFinalResult.away
      };
      alert(`😢 Incorrect prediction. Escrow was cleared, and the collaterial sticker was liquidated. Try again to polish your strategic foresight!`);
    }

    saveBetsList(updatedBets);
    setSimulatingBetId(null);
    setSimFinalResult(null);
    setSimLog([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
      
      {/* Immersive Header Banner */}
      <div className="bg-gradient-to-br from-[#002F6C] to-[#124285] p-6 rounded-3xl border border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,205,0,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFCD00] text-[#002F6C] rounded-full text-[10px] font-sans font-black uppercase tracking-wider shadow-sm">
            <Trophy className="h-3 w-3 animate-pulse" />
            <span>Bosnia World Cup 2026 Prediction Arena</span>
          </div>
          <h2 className="text-3xl font-sans font-black tracking-tighter uppercase">
            Metaplex NFT Card Betting
          </h2>
          <p className="text-xs font-serif text-gray-200 leading-relaxed italic">
            Unlock your strategic sports insights! Put your unpasted sticker pouch inventory to the test. Escrow lock a card, predict the exact score line, and win premium Solana jackpot rewards or card duplication multiplier boosts.
          </p>
        </div>

        <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center w-40 z-10">
          <Award className="h-10 w-10 text-[#FFCD00] drop-shadow-sm mb-1.5" />
          <span className="text-[10px] font-sans font-black uppercase text-gray-300 leading-none">JACKPOT POOL</span>
          <span className="text-2xl font-mono font-black text-white">+2.0 SOL</span>
          <span className="text-[9px] font-sans text-amber-300 font-semibold block mt-1">+1 Card Copy</span>
        </div>
      </div>

      {/* Grid: Matches Selector on Left, Predict/Tactics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 5 cols: Game schedule picker */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-sans font-black text-xs text-[#002F6C] uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="h-4 w-4" />
            <span>Select Group Match ({UPCOMING_MATCHES.length} Games)</span>
          </h3>

          <div className="space-y-3">
            {UPCOMING_MATCHES.map((match) => {
              const isSelected = selectedMatch.id === match.id;
              return (
                <button
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`w-full p-4 rounded-2xl text-left border transition relative flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#002F6C] shadow-md ring-2 ring-[#002F6C]/10"
                      : "bg-[#fcfbf7] hover:bg-white border-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] font-sans font-extrabold text-gray-400 uppercase tracking-widest block">
                      {match.stage}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇧🇦</span>
                      <span className="font-sans font-black text-gray-700">BIH</span>
                      <span className="text-xs font-mono text-gray-400">vs</span>
                      <span className="text-xl">{match.opponentFlag}</span>
                      <span className="font-sans font-black text-gray-800">{match.opponent}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{match.timestamp.split(" - ")[0]}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Select Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                    isSelected ? "bg-[#002F6C] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                  }`}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Possible starting 11 tactical projection & Bet Confirmation */}
        <div className="lg:col-span-7 space-y-6 bg-white border border-gray-300 p-6 rounded-3xl shadow-sm">
          
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <span className="text-[10px] font-sans font-black text-gray-400 tracking-wider block uppercase">TACTICAL MATRIX</span>
              <h3 className="text-xl font-sans font-black text-[#002F6C] leading-none mb-1">
                Possible Squad vs {selectedMatch.opponent}
              </h3>
              <p className="text-xs font-sans text-gray-500 flex items-center space-x-1.5 mt-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span>{selectedMatch.stadium} ({selectedMatch.city})</span>
              </p>
            </div>
            
            <span className="text-xs font-mono bg-amber-500/15 border border-amber-500/40 text-amber-800 px-2.5 py-1 rounded font-bold">
              Odds: {selectedMatch.defaultOdds.split(" | ")[2]}
            </span>
          </div>

          {/* Roster roster cards projection */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-sans font-bold text-gray-400 tracking-wider uppercase block">PROJECTED STARTING ELEVEN</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedMatch.squadIds.map((pid) => {
                const p = STICKERS.find(s => s.id === pid);
                if (!p) return null;
                return (
                  <div key={p.id} className="p-2 bg-[#f9f8f4] border border-gray-200 rounded-xl flex items-center space-x-2">
                    <span className="font-sans text-[10px] font-black w-6 h-6 bg-[#002F6C] text-white rounded-md flex items-center justify-center shadow-inner shrink-0">
                      {p.number}
                    </span>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs font-sans font-black text-gray-800 truncate leading-none mb-0.5">{p.name.split(" ").slice(-1)[0]}</p>
                      <p className="text-[9px] font-sans font-bold text-gray-500 uppercase tracking-tight truncate">{p.role} • {p.club}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handlePlaceBet} className="pt-4 border-t border-gray-200 space-y-4">
            <h4 className="text-[10px] font-sans font-black text-gray-450 tracking-wider uppercase block">PREDICTION SCORE & ESCROW COLLATERAL</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Score predict dials */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">PREDICT MATCH SCORE</span>
                
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="text-xs font-sans font-black text-gray-600 block mb-1">BIH Goals</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPredHome(prev => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-xl font-mono font-black text-[#002F6C]">{predHome}</span>
                      <button
                        type="button"
                        onClick={() => setPredHome(prev => Math.min(10, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-300" />

                  <div className="text-center">
                    <span className="text-xs font-sans font-black text-gray-600 block mb-1">{selectedMatch.opponent} Goals</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPredAway(prev => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-xl font-mono font-black text-gray-800">{predAway}</span>
                      <button
                        type="button"
                        onClick={() => setPredAway(prev => Math.min(10, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collateral Selection dropdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 text-left">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">ESCROW COVER (NFT SLOTS)</span>
                
                <div>
                  <label className="text-[10px] font-sans font-bold text-gray-500 uppercase block mb-1">UNPASTED BAG SELECTOR</label>
                  {bettableStickers.length === 0 ? (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-sans text-rose-600 font-semibold leading-relaxed">
                      No unpasted duplicates available! Acquire booster packs to load card escrow collateral.
                    </div>
                  ) : (
                    <select
                      value={betStickerId}
                      onChange={(e) => setBetStickerId(Number(e.target.value))}
                      className="w-full text-xs font-sans bg-white border border-gray-300 hover:border-gray-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#002F6C] font-semibold text-gray-800 cursor-pointer"
                    >
                      <option value={-1}>-- Select Duplication Card --</option>
                      {bettableStickers.map((item) => (
                        <option key={item.stickerId} value={item.stickerId}>
                          #{item.player?.number} {item.player?.name} ({item.count} free copy)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

            </div>

            {/* Error or Success alerts */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700 font-semibold">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action submit button */}
            <button
              type="submit"
              disabled={bettableStickers.length === 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-sans font-black uppercase text-xs tracking-wider transition-all duration-150 relative overflow-hidden flex items-center justify-center space-x-2 cursor-pointer ${
                bettableStickers.length === 0
                  ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#002F6C] to-[#124285] hover:opacity-95 text-white shadow"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>LOCK CARD & PLACE SCORE BET</span>
            </button>
          </form>

        </div>
      </div>

      {/* active escrowed bets logs */}
      <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-sm">
        <h3 className="font-sans font-black text-sm text-[#002F6C] uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-gray-100 pb-3">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Active Escrow Live Predictions Arena ({bets.length})</span>
        </h3>

        {bets.length === 0 ? (
          <div className="py-12 text-center text-[#1a1a1a]">
            <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-serif italic text-gray-500">
              No active predictions found in Metaplex Solflare Ledger. Select a match and place a bet!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet, idx) => {
              const match = UPCOMING_MATCHES.find(m => m.id === bet.matchId);
              const card = STICKERS.find(s => s.id === bet.betStickerId);
              if (!match || !card) return null;

              const isSimulating = simulatingBetId === bet.id;

              return (
                <div key={bet.id} className="border border-gray-250 rounded-2xl p-5 bg-[#fdfdfc] flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Predict Info */}
                  <div className="space-y-2 flex-grow text-left">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full font-black uppercase border tracking-wider leading-none ${
                        bet.status === "ACTIVE"
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : bet.status === "WON"
                          ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}>
                        {bet.status} ESCROW
                      </span>
                      <span className="text-xs font-mono text-gray-400">TXREF-ID: {bet.id.toUpperCase()}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-sans font-black text-base text-gray-800">
                        BIH vs {match.opponent} {match.opponentFlag}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm font-sans font-black text-[#002F6C]">
                        Predicted Score: {bet.predHomeGoals} - {bet.predAwayGoals}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="font-sans font-bold text-gray-600">Locked Asset:</span>
                        <span className="font-sans font-black text-[#002F6C]">#{card.number} {card.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Simulation stream overlay */}
                  {isSimulating && (
                    <div className="flex-grow max-w-lg bg-gray-950 border border-zinc-800 p-4 rounded-xl text-left text-xs font-mono text-emerald-400 space-y-2 transition-all">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold tracking-widest uppercase border-b border-zinc-800 pb-1.5 animate-pulse">
                        <span>LIVE commentary matchday</span>
                        <span>{Math.round((simProgress / 7) * 100)}% PLAYED</span>
                      </div>
                      <div className="h-24 overflow-y-auto space-y-1 select-none pr-1 scrollbar-thin">
                        {simLog.map((log, i) => (
                          <p key={i} className="leading-relaxed animate-fade-in">{log}</p>
                        ))}
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${(simProgress / 7) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Right: simulation actions */}
                  <div className="shrink-0 flex items-center space-x-4">
                    {bet.status === "ACTIVE" && !isSimulating && (
                      <button
                        onClick={() => startSimulation(bet)}
                        disabled={simulatingBetId !== null}
                        className={`py-2 px-5 rounded-xl font-sans font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center space-x-1.5 cursor-pointer ${
                          simulatingBetId !== null
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            : "bg-[#002F6C]/10 border border-[#002F6C]/30 text-[#002F6C] hover:bg-[#002F6C] hover:text-white"
                        }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Simulate Match Outcome</span>
                      </button>
                    )}

                    {isSimulating && simProgress === 7 && (
                      <button
                        onClick={() => claimBetReward(bet, idx)}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md flex items-[#FFCD00] space-x-1 animate-bounce cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Claim Escrow Outcome</span>
                      </button>
                    )}

                    {bet.status !== "ACTIVE" && (
                      <div className="text-right">
                        <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase">ACTUAL RESULT</span>
                        <span className="text-lg font-mono font-black text-gray-700">
                          BIH {bet.actualHomeGoals} - {bet.actualAwayGoals} {match.opponent}
                        </span>
                        <p className={`text-xs font-sans font-bold mt-0.5 ${bet.status === "WON" ? "text-emerald-600" : "text-rose-500"}`}>
                          {bet.status === "WON" ? "🎉 Exact Match Won! +2.0 SOL" : " Liquidated Escrow"}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
