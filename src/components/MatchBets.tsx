import React, { useState, useEffect } from "react";
import { Play, Calendar, Clock, MapPin, Award, Lock, Trophy, Sparkles, CheckCircle2, AlertTriangle, Coins } from "lucide-react";
import { Sticker, UserSticker, WalletState } from "../types";
import { STICKERS } from "../data/players";
import { Language, UI_TRANSLATIONS } from "../data/translations";

interface MatchBetsProps {
  wallet: WalletState;
  onWalletChange: (w: WalletState) => void;
  collection: UserSticker[];
  onCollectionChange: (newCollection: UserSticker[]) => void;
  lang: Language;
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
  stageBS: string;
  defaultOdds: string;
  squadIds: number[];
}

interface Bet {
  id: string;
  matchId: string;
  wagerType: "SOL" | "STICKER";
  predOutcome: "WIN" | "DRAW" | "LOSS";
  predHomeGoals: number;
  predAwayGoals: number;
  predScorerId: number;
  betStickerId?: number;
  status: "ACTIVE" | "WON" | "LOST";
  actualHomeGoals?: number;
  actualAwayGoals?: number;
  actualScorerId?: number;
  correctPicks?: number;
  createdAt: number;
}

const UPCOMING_MATCHES: Match[] = [
  {
    id: "match-wc26-canada",
    opponent: "Canada",
    opponentFlag: "🇨🇦",
    opponentCrestTheme: "from-red-650 via-white to-red-650",
    timestamp: "June 12, 2026 - 21:00 CEST (Bosnian Time)",
    stadium: "BC Place Arena",
    city: "Vancouver, Canada",
    stage: "Group Stage - Matchday 1",
    stageBS: "Grupna faza - 1. Kolo",
    defaultOdds: "Canada (2.35) | Draw (3.40) | Bosnia (2.95)",
    squadIds: [1, 5, 2, 3, 17, 6, 7, 18, 8, 10, 9],
  },
  {
    id: "match-wc26-switzerland",
    opponent: "Switzerland",
    opponentFlag: "🇨🇭",
    opponentCrestTheme: "from-red-600 via-white to-red-600",
    timestamp: "June 18, 2026 - 21:00 CEST (Bosnian Time)",
    stadium: "Gillette Stadium",
    city: "Boston, USA",
    stage: "Group Stage - Matchday 2",
    stageBS: "Grupna faza - 2. Kolo",
    defaultOdds: "Switzerland (2.10) | Draw (3.30) | Bosnia (3.50)",
    squadIds: [1, 5, 4, 2, 3, 6, 20, 19, 11, 10, 9],
  },
  {
    id: "match-wc26-qatar",
    opponent: "Qatar",
    opponentFlag: "🇶🇦",
    opponentCrestTheme: "from-red-800 via-white to-amber-950",
    timestamp: "June 24, 2026 - 21:00 CEST (Bosnian Time)",
    stadium: "Hard Rock Stadium",
    city: "Miami, USA",
    stage: "Group Stage - Matchday 3",
    stageBS: "Grupna faza - 3. Kolo",
    defaultOdds: "Qatar (3.60) | Draw (3.25) | Bosnia (2.00)",
    squadIds: [16, 22, 2, 3, 17, 6, 7, 18, 8, 21, 10],
  }
];

export default function MatchBets({ wallet, onWalletChange, collection, onCollectionChange, lang }: MatchBetsProps) {
  // Default to Qatar since Canada and Switzerland ended
  const [selectedMatch, setSelectedMatch] = useState<Match>(UPCOMING_MATCHES[2]);

  const [wagerType, setWagerType] = useState<"SOL" | "STICKER">("SOL");
  const [predOutcome, setPredOutcome] = useState<"WIN" | "DRAW" | "LOSS">("WIN");
  const [predHome, setPredHome] = useState<number>(2);
  const [predAway, setPredAway] = useState<number>(1);
  const [predScorerId, setPredScorerId] = useState<number>(-1);
  const [betStickerId, setBetStickerId] = useState<number>(-1);

  const [bets, setBets] = useState<Bet[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulation Ticker State
  const [simulatingBetId, setSimulatingBetId] = useState<string | null>(null);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [simFinalResult, setSimFinalResult] = useState<{ home: number; away: number; scorerId: number } | null>(null);

  const t = UI_TRANSLATIONS[lang];

  useEffect(() => {
    const savedBets = localStorage.getItem("bosnia_wc26_match_bets_v2");
    if (savedBets) {
      setBets(JSON.parse(savedBets));
    }
  }, []);

  const saveBetsList = (newBets: Bet[]) => {
    setBets(newBets);
    localStorage.setItem("bosnia_wc26_match_bets_v2", JSON.stringify(newBets));
  };

  const bettableStickers = collection.filter(c => c.count > 0 && !c.pasted).map(c => {
    const orig = STICKERS.find(s => s.id === c.stickerId);
    return { ...c, player: orig };
  }).filter(item => item.player !== undefined);

  const squadPlayers = selectedMatch.squadIds.map(id => STICKERS.find(s => s.id === id)).filter(Boolean) as Sticker[];

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!wallet.connected) {
      setErrorMsg(lang === "BS"
        ? "Prvo povežite Vaš virtuelni novčanik za zaključavanje Metaplex pametnog ugovora!"
        : "Please connect your Solflare mock wallet first to place a prediction!");
      return;
    }

    if (wagerType === "SOL" && wallet.balance < 0.02) {
      setErrorMsg("You need at least 0.02 SOL to place a prediction!");
      return;
    }

    if (wagerType === "STICKER" && betStickerId === -1) {
      setErrorMsg(lang === "BS"
        ? "Odaberite nezalijepljenu sličicu iz kesice kao depozit!"
        : "Please select a physical unpasted sticker from your pouch to serve as escrow!");
      return;
    }

    if (predScorerId === -1) {
      setErrorMsg("Please select a predicted goal scorer!");
      return;
    }

    if (wagerType === "STICKER") {
      const record = collection.find(c => c.stickerId === betStickerId);
      if (!record || record.count <= 0 || record.pasted) {
        setErrorMsg("Sticker is no longer available in your pouch!");
        return;
      }
      const updatedCollection = collection.map(c => {
        if (c.stickerId === betStickerId) return { ...c, count: c.count - 1 };
        return c;
      }).filter(c => c.count > 0 || c.pasted);
      onCollectionChange(updatedCollection);
    } else {
      onWalletChange({
        ...wallet,
        balance: Number((wallet.balance - 0.02).toFixed(2))
      });
    }

    const newBet: Bet = {
      id: "bet-" + Math.random().toString(36).substr(2, 9),
      matchId: selectedMatch.id,
      wagerType,
      predOutcome,
      predHomeGoals: predHome,
      predAwayGoals: predAway,
      predScorerId,
      betStickerId: wagerType === "STICKER" ? betStickerId : undefined,
      status: "ACTIVE",
      createdAt: Date.now()
    };

    const newBetsList = [newBet, ...bets];
    saveBetsList(newBetsList);

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
    } catch (_) { }

    setSuccessMsg(`✓ Prediction placed successfully! Locked ${wagerType === "SOL" ? "0.02 SOL" : "1 Sticker"} in Escrow.`);
    if (wagerType === "STICKER") setBetStickerId(-1);
  };

  const startSimulation = (bet: Bet) => {
    if (simulatingBetId) return;

    setSimProgress(0);
    setSimulatingBetId(bet.id);
    setSimFinalResult(null);

    const targetMatch = UPCOMING_MATCHES.find(m => m.id === bet.matchId);
    if (!targetMatch) return;

    // We force the actual result to be somewhat random but likely to match user's bet sometimes for testing
    let currentHomeGoals = 0;
    let currentAwayGoals = 0;
    let actualScorerId = targetMatch.squadIds[Math.floor(Math.random() * targetMatch.squadIds.length)];

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + 1;
        let logText = "";

        if (next === 1) {
          logText = `⏱️ 1' Kickoff! Match begins at ${targetMatch.stadium}.`;
          setSimLog([logText]);
        } else if (next === 2) {
          logText = `⏱️ 22' Tense midfield battle...`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 3) {
          if (Math.random() > 0.3) {
            currentHomeGoals += 1;
            const scorer = STICKERS.find(s => s.id === actualScorerId);
            logText = `⚽ 41' Goal!!! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}! ${scorer?.name} scores!`;
          } else {
            currentAwayGoals += 1;
            logText = `⚽ 38' Goal for ${targetMatch.opponent}! ${targetMatch.opponent} ${currentAwayGoals} - ${currentHomeGoals} BIH.`;
          }
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 4) {
          logText = `⏱️ 45+2' Half-time.`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 5) {
          logText = `⏱️ 67' Heavy pressure from both sides.`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 6) {
          if (Math.random() > 0.5) {
            currentHomeGoals += 1;
            logText = `⚽ 81' GOAAAL!!! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}!`;
          } else if (Math.random() > 0.6) {
            currentAwayGoals += 1;
            logText = `⚽ 85' Goal for ${targetMatch.opponent}! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}.`;
          } else {
            logText = `⏱️ 88' Tense final minutes!`;
          }
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 7) {
          logText = `🏁 90' Full-time! Final score: BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}.`;
          setSimLog(prevLogs => [...prevLogs, logText]);
          setSimFinalResult({ home: currentHomeGoals, away: currentAwayGoals, scorerId: actualScorerId });
          clearInterval(interval);
        }

        return next;
      });
    }, 1200);
  };

  const claimBetReward = (bet: Bet, index: number) => {
    if (!simFinalResult) return;

    const actualOutcome = simFinalResult.home > simFinalResult.away ? "WIN" : (simFinalResult.home === simFinalResult.away ? "DRAW" : "LOSS");
    let correct = 0;
    if (bet.predOutcome === actualOutcome) correct++;
    if (bet.predHomeGoals === simFinalResult.home && bet.predAwayGoals === simFinalResult.away) correct++;
    if (bet.predScorerId === simFinalResult.scorerId) correct++;

    const updatedBets = [...bets];
    const updatedCollection = [...collection];
    let payoutMsg = "";

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = correct > 0 ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(correct > 0 ? 523.25 : 150, audioCtx.currentTime);
      if (correct === 3) {
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
    } catch (_) { }

    if (correct === 0) {
      payoutMsg = `😢 Incorrect prediction. Escrow liquidated. 0/3 correct.`;
    } else if (correct === 1) {
      onWalletChange({ ...wallet, balance: Number((wallet.balance + 0.02).toFixed(2)) });
      payoutMsg = `Refund! You got 1/3 correct. Received 0.02 SOL back.`;
    } else if (correct === 2) {
      onWalletChange({ ...wallet, balance: Number((wallet.balance + 0.05).toFixed(2)) });
      payoutMsg = `Nice! You got 2/3 correct. Won 0.05 SOL!`;
    } else if (correct === 3) {
      onWalletChange({ ...wallet, balance: Number((wallet.balance + 0.20).toFixed(2)) });
      payoutMsg = `🎉 JACKPOT! You got 3/3 correct! Won 0.20 SOL!`;
    }

    updatedBets[index] = {
      ...bet,
      status: correct > 0 ? "WON" : "LOST",
      actualHomeGoals: simFinalResult.home,
      actualAwayGoals: simFinalResult.away,
      actualScorerId: simFinalResult.scorerId,
      correctPicks: correct
    };

    alert(payoutMsg);
    onCollectionChange(updatedCollection);
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
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFCD00] text-[#002F6C] rounded-full text-[10px] font-sans font-black uppercase tracking-wider shadow-sm">
            <Trophy className="h-3 w-3 animate-pulse" />
            <span>Prediction Game</span>
          </div>
          <h2 className="text-3xl font-sans font-black tracking-tighter uppercase leading-none mt-1">
            Match Predictor
          </h2>
          <p className="text-xs font-serif text-gray-200 leading-relaxed italic mt-1.5">
            Predict the outcome, exact score, and goal scorer to win up to 0.20 SOL! Entry fee: 0.02 SOL or 1 Duplicate Sticker.
          </p>
        </div>

        <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center w-40 z-10">
          <span className="text-[10px] font-sans font-black uppercase text-amber-300 leading-none">JACKPOT POOL</span>
          <span className="text-2xl font-mono font-black text-white mt-1">0.20 SOL</span>
          <span className="text-[9px] font-sans text-gray-300 font-semibold block mt-1">FOR 3/3 CORRECT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left 5 cols: Game schedule picker */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-sans font-black text-xs text-[#002F6C] uppercase tracking-wider flex items-center space-x-1.5 leading-none">
            <Calendar className="h-4 w-4" />
            <span>Select Group Match</span>
          </h3>

          <div className="space-y-3">
            {UPCOMING_MATCHES.map((match) => {
              const isSelected = selectedMatch.id === match.id;
              // Ended matches, disable them
              if (match.id === "match-wc26-canada" || match.id === "match-wc26-switzerland") {
                const result = match.id === "match-wc26-canada" ? "1:1" : "1:4";
                return (
                  <div key={match.id} className="w-full p-4 rounded-2xl text-left border bg-gray-100 border-gray-300 opacity-60 flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <span className="text-[9px] font-sans font-extrabold text-gray-400 uppercase tracking-widest block leading-none">ENDED ({result})</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🇧🇦</span>
                        <span className="font-sans font-black text-gray-700">BIH</span>
                        <span className="text-xs font-mono text-gray-400">vs</span>
                        <span className="text-xl">{match.opponentFlag}</span>
                        <span className="font-sans font-black text-gray-800">{match.opponent}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                  className={`w-full p-4 rounded-2xl text-left border transition relative flex items-center justify-between group cursor-pointer ${isSelected
                      ? "bg-white border-[#002F6C] shadow-md ring-2 ring-[#002F6C]/10"
                      : "bg-[#fcfbf7] hover:bg-white border-gray-300 hover:border-gray-500"
                    }`}
                >
                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] font-sans font-extrabold text-gray-400 uppercase tracking-widest block leading-none">
                      {lang === "BS" ? match.stageBS : match.stage}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇧🇦</span>
                      <span className="font-sans font-black text-gray-700">BIH</span>
                      <span className="text-xs font-mono text-gray-400">vs</span>
                      <span className="text-xl">{match.opponentFlag}</span>
                      <span className="font-sans font-black text-gray-800">{match.opponent}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1 leading-none">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{match.timestamp.split(" - ")[0]}</span>
                      </span>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${isSelected ? "bg-[#002F6C] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Prediction Slip */}
        <div className="lg:col-span-7 space-y-6 bg-white border border-gray-300 p-6 rounded-3xl shadow-sm">

          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <span className="text-[10px] font-sans font-black text-gray-400 tracking-wider block uppercase leading-none">PREDICTION SLIP</span>
              <h3 className="text-xl font-sans font-black text-[#002F6C] leading-none mb-1 mt-1.5">
                Bosnia vs {selectedMatch.opponent}
              </h3>
            </div>
          </div>

          <form onSubmit={handlePlaceBet} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">1. MATCH OUTCOME</span>
                <select
                  value={predOutcome}
                  onChange={(e) => setPredOutcome(e.target.value as any)}
                  className="w-full text-xs font-sans bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#002F6C] font-semibold text-gray-800 cursor-pointer mt-1"
                >
                  <option value="WIN">Bosnia Win</option>
                  <option value="DRAW">Draw</option>
                  <option value="LOSS">Bosnia Loss</option>
                </select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">2. EXACT SCORE</span>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="text-xs font-sans font-black text-gray-600 block mb-1">BIH</span>
                    <div className="flex items-center space-x-1.5">
                      <button type="button" onClick={() => setPredHome(prev => Math.max(0, prev - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer">-</button>
                      <span className="w-8 text-xl font-mono font-black text-[#002F6C]">{predHome}</span>
                      <button type="button" onClick={() => setPredHome(prev => Math.min(10, prev + 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer">+</button>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-sans font-black text-gray-600 block mb-1">{selectedMatch.opponent}</span>
                    <div className="flex items-center space-x-1.5">
                      <button type="button" onClick={() => setPredAway(prev => Math.max(0, prev - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer">-</button>
                      <span className="w-8 text-xl font-mono font-black text-gray-800">{predAway}</span>
                      <button type="button" onClick={() => setPredAway(prev => Math.min(10, prev + 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 cursor-pointer">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 sm:col-span-2">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">3. GOAL SCORER</span>
                <select
                  value={predScorerId}
                  onChange={(e) => setPredScorerId(Number(e.target.value))}
                  className="w-full text-xs font-sans bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#002F6C] font-semibold text-gray-800 cursor-pointer mt-1"
                >
                  <option value={-1}>-- Select Goal Scorer --</option>
                  {squadPlayers.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.number} {item.name} ({item.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 sm:col-span-2">
                <span className="text-[9px] font-sans font-bold text-gray-400 block uppercase leading-none">ENTRY FEE (PAYMENT METHOD)</span>

                <div className="flex bg-white rounded-lg border border-gray-300 p-1 mb-3">
                  <button type="button" onClick={() => setWagerType("SOL")} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center space-x-1 ${wagerType === "SOL" ? "bg-[#002F6C] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    <Coins className="w-3.5 h-3.5" /> <span>0.02 SOL</span>
                  </button>
                  <button type="button" onClick={() => setWagerType("STICKER")} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center space-x-1 ${wagerType === "STICKER" ? "bg-[#002F6C] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                    <Trophy className="w-3.5 h-3.5" /> <span>1 STICKER</span>
                  </button>
                </div>

                {wagerType === "STICKER" && (
                  <select
                    value={betStickerId}
                    onChange={(e) => setBetStickerId(Number(e.target.value))}
                    className="w-full text-xs font-sans bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#002F6C] font-semibold text-gray-800 cursor-pointer"
                  >
                    <option value={-1}>-- Select Duplicate Sticker to Burn --</option>
                    {bettableStickers.map((item) => (
                      <option key={item.stickerId} value={item.stickerId}>
                        #{item.player?.number} {item.player?.name} ({item.count} extra)
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-205 rounded-xl flex items-center space-x-2 text-xs text-rose-700 font-semibold leading-snug">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold leading-snug">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 px-6 rounded-2xl font-sans font-black uppercase text-xs tracking-wider transition-all duration-150 relative flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-[#002F6C] to-[#124285] hover:opacity-95 text-white shadow`}
            >
              <Lock className="h-4 w-4" />
              <span>SUBMIT PREDICTION SLIP</span>
            </button>
          </form>

        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-sm">
        <h3 className="font-sans font-black text-sm text-[#002F6C] uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-gray-100 pb-3 leading-none">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Active Predictions Arena ({bets.length})</span>
        </h3>

        {bets.length === 0 ? (
          <div className="py-12 text-center text-[#1a1a1a]">
            <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-serif italic text-gray-500 text-center leading-relaxed">
              No active predictions found. Select a match and place a bet!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet, idx) => {
              const match = UPCOMING_MATCHES.find(m => m.id === bet.matchId);
              const card = bet.betStickerId ? STICKERS.find(s => s.id === bet.betStickerId) : null;
              const scorer = STICKERS.find(s => s.id === bet.predScorerId);
              if (!match || (!card && bet.wagerType === "STICKER")) return null;

              const isSimulating = simulatingBetId === bet.id;

              return (
                <div key={bet.id} className="border border-gray-250 rounded-2xl p-5 bg-[#fdfdfc] flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">

                  <div className="space-y-2 flex-grow text-left">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[9px] font-sans px-2.5 py-0.5 rounded-full font-black uppercase border tracking-wider leading-none ${bet.status === "ACTIVE"
                          ? "bg-amber-100 border-amber-300 text-amber-800"
                          : bet.status === "WON"
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                        {bet.status} SLIP
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-sans font-black text-base text-gray-800 leading-none">
                        BIH vs {match.opponent} {match.opponentFlag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span><strong>Score:</strong> {bet.predHomeGoals}-{bet.predAwayGoals} ({bet.predOutcome})</span>
                      <span><strong>Scorer:</strong> {scorer?.name}</span>
                      <span><strong>Wager:</strong> {bet.wagerType === "SOL" ? "0.02 SOL" : card?.name}</span>
                    </div>
                  </div>

                  {isSimulating && (
                    <div className="flex-grow max-w-lg bg-gray-950 border border-zinc-800 p-4 rounded-xl text-left text-xs font-mono text-emerald-400 space-y-2 transition-all">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold tracking-widest uppercase border-b border-zinc-800 pb-1.5 animate-pulse">
                        <span>LIVE simulation</span>
                        <span>{Math.round((simProgress / 7) * 100)}% PLAYED</span>
                      </div>
                      <div className="h-24 overflow-y-auto space-y-1.5 select-none pr-1 scrollbar-thin">
                        {simLog.map((log, i) => (
                          <p key={i} className="leading-relaxed animate-fade-in">{log}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="shrink-0 flex items-center space-x-4 font-sans">
                    {bet.status === "ACTIVE" && !isSimulating && (
                      <button
                        onClick={() => startSimulation(bet)}
                        disabled={simulatingBetId !== null}
                        className={`py-2 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center space-x-1.5 cursor-pointer ${simulatingBetId !== null
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                            : "bg-[#002F6C]/10 border border-[#002F6C]/20 text-[#002F6C] hover:bg-[#002F6C] hover:text-white"
                          }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Simulate Match Result</span>
                      </button>
                    )}

                    {isSimulating && simProgress === 7 && (
                      <button
                        onClick={() => claimBetReward(bet, idx)}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center space-x-1 animate-bounce cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Evaluate Ticket</span>
                      </button>
                    )}

                    {bet.status !== "ACTIVE" && (
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 block uppercase leading-none">RESULT</span>
                        <span className="text-sm sm:text-base font-mono font-black text-gray-700 block mt-1">
                          BIH {bet.actualHomeGoals} - {bet.actualAwayGoals} {match.opponent}
                        </span>
                        <p className={`text-xs font-bold mt-1 ${bet.status === "WON" ? "text-emerald-600" : "text-rose-500"}`}>
                          {bet.correctPicks}/3 Correct
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
