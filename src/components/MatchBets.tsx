import React, { useState, useEffect } from "react";
import { Play, Calendar, Clock, Award, Lock, Trophy, Sparkles, CheckCircle2, AlertTriangle, Coins, Wifi, WifiOff } from "lucide-react";
import { Sticker, StickerType, UserSticker, WalletState } from "../types";
import { STICKERS } from "../data/players";
import { Language, UI_TRANSLATIONS } from "../data/translations";

// IPFS gateway and local fallback config
const IPFS_CID = "bafybeigu6pd4t72n7dskbn5wpk5pphf2566xixx5fugw3xhc3cyt44tumy";
const IPFS_GATEWAY = `https://${IPFS_CID}.ipfs.dweb.link/components`;
const IPFS_TIMEOUT_MS = 100_000; // 100 seconds

// Track IPFS reachability globally (cached for session)
let ipfsReachable: boolean | null = null;
let ipfsCheckPromise: Promise<boolean> | null = null;

async function checkIpfsReachability(): Promise<boolean> {
  if (ipfsReachable !== null) return ipfsReachable;
  if (ipfsCheckPromise) return ipfsCheckPromise;
  ipfsCheckPromise = new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => {
      ipfsReachable = false;
      resolve(false);
    }, IPFS_TIMEOUT_MS);
    fetch(`${IPFS_GATEWAY}/special_collection/GoldenCrest.webp`, { method: "HEAD", cache: "no-store" })
      .then(() => { clearTimeout(timer); ipfsReachable = true; resolve(true); })
      .catch(() => { clearTimeout(timer); ipfsReachable = false; resolve(false); });
  });
  return ipfsCheckPromise;
}

function getCardImageUrl(imageFile: string, folder: string): string {
  return `${IPFS_GATEWAY}/${folder}/${imageFile}`;
}

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

// Matches where the result is known — keyed by match id
const ENDED_RESULTS: Record<string, {
  score: string;
  bihGoals: number;
  oppGoals: number;
  scorerIds: number[];
  scorerNames: string[];
}> = {
  "match-wc26-canada": {
    score: "1:1",
    bihGoals: 1,
    oppGoals: 1,
    scorerIds: [9],
    scorerNames: ["Bajraktarević"]
  },
  "match-wc26-switzerland": {
    score: "1:4",
    bihGoals: 1,
    oppGoals: 4,
    scorerIds: [11],
    scorerNames: ["Džeko"]
  },
  "match-wc26-qatar": {
    score: "3:1",
    bihGoals: 3,
    oppGoals: 1,
    scorerIds: [8, 11, 16],
    scorerNames: ["Alajbegović", "Džeko", "Mahmić"]
  }
};

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
  },
  {
    id: "match-wc26-usa-playoff",
    opponent: "USA",
    opponentFlag: "🇺🇸",
    opponentCrestTheme: "from-blue-700 via-red-600 to-white",
    timestamp: "July 2, 2026 - 21:00 CEST (Bosnian Time)",
    stadium: "SoFi Stadium",
    city: "Los Angeles, USA",
    stage: "Round of 16 — Playoff",
    stageBS: "Osmina finala — Doigravanje",
    defaultOdds: "USA (2.20) | Draw (3.30) | Bosnia (3.10)",
    squadIds: [1, 2, 3, 5, 6, 7, 8, 10, 11, 17, 22],
  }
];

export default function MatchBets({ wallet, onWalletChange, collection, onCollectionChange, lang }: MatchBetsProps) {
  // Default to USA playoff (latest open match)
  const [selectedMatch, setSelectedMatch] = useState<Match>(UPCOMING_MATCHES[3]);
  const [ipfsStatus, setIpfsStatus] = useState<"checking" | "online" | "offline">("checking");

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
    // Check IPFS reachability with 100s timeout
    checkIpfsReachability().then(ok => setIpfsStatus(ok ? "online" : "offline"));
  }, []);

  const saveBetsList = (newBets: Bet[]) => {
    setBets(newBets);
    localStorage.setItem("bosnia_wc26_match_bets_v2", JSON.stringify(newBets));
  };

  // Returns image URL — IPFS if online, local vite module URL as fallback
  const resolveCardImage = (imageFile: string, isSpecial: boolean): string => {
    const folder = isSpecial ? "special_collection" : "players";
    if (ipfsStatus !== "offline") {
      return getCardImageUrl(imageFile, folder);
    }
    // Fallback: use Vite local asset via dynamic import path (served by dev server)
    return `/src/components/${folder}/${imageFile}`;
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

  const checkRealMatchResult = async (bet: Bet) => {
    if (simulatingBetId) return;

    setSimProgress(0);
    setSimulatingBetId(bet.id);
    setSimFinalResult(null);
    setSimLog(["🔍 Connecting to v3.football.api-sports.io via Redis..."]);

    const targetMatch = UPCOMING_MATCHES.find(m => m.id === bet.matchId);
    if (!targetMatch) return;

    try {
      setSimLog(prev => [...prev, "📡 Fetching real match data..."]);
      const res = await fetch('/api/get-matches');

      if (!res.ok) {
        throw new Error("Failed to connect to API endpoint");
      }

      const data = await res.json();
      setSimLog(prev => [...prev, "✅ Data received! Processing actual results..."]);

      // In a fully real scenario, you'd match by date or opponent.
      // For this implementation, we will look for a match against the opponent.
      const realMatch = data.find((fixture: any) =>
        fixture.teams.home.name.includes(targetMatch.opponent) ||
        fixture.teams.away.name.includes(targetMatch.opponent)
      );

      let currentHomeGoals = 0;
      let currentAwayGoals = 0;

      if (realMatch && realMatch.fixture.status.short === "FT") {
        // Real Match Finished
        const isBosniaHome = realMatch.teams.home.id === 18;
        currentHomeGoals = isBosniaHome ? realMatch.goals.home : realMatch.goals.away;
        currentAwayGoals = isBosniaHome ? realMatch.goals.away : realMatch.goals.home;
        setSimLog(prev => [...prev, `🏁 Full-time real result: BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}`]);
      } else {
        // Fallback: If the real match hasn't happened or API rate limit, use random realistic outcome for demo
        setSimLog(prev => [...prev, `⚠️ Real match pending or not found. Simulating possible outcome...`]);
        currentHomeGoals = Math.floor(Math.random() * 3);
        currentAwayGoals = Math.floor(Math.random() * 3);
        setSimLog(prev => [...prev, `🏁 Simulated Full-time result: BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}`]);
      }

      // Pick a random scorer from squad to simulate the scorer since API-Sports requires a separate endpoint for events
      const actualScorerId = targetMatch.squadIds[Math.floor(Math.random() * targetMatch.squadIds.length)];

      setSimProgress(7); // Mark as complete
      setSimFinalResult({ home: currentHomeGoals, away: currentAwayGoals, scorerId: actualScorerId });

    } catch (error) {
      console.error(error);
      setSimLog(prev => [...prev, "❌ Error fetching real match data. Please check API Key and Redis."]);
      setSimulatingBetId(null);
    }
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
            <span>Select Match</span>
          </h3>

          {/* IPFS status indicator */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border ${ipfsStatus === "checking" ? "bg-amber-50 border-amber-200 text-amber-700" :
            ipfsStatus === "online" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
              "bg-rose-50 border-rose-200 text-rose-700"
            }`}>
            {ipfsStatus === "offline" ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
            <span>
              {ipfsStatus === "checking" ? "Checking IPFS…" :
                ipfsStatus === "online" ? `IPFS Online · CID: ${IPFS_CID.slice(0, 12)}…` :
                  "IPFS Offline · Using Local Backup"}
            </span>
          </div>

          <div className="space-y-3">
            {UPCOMING_MATCHES.map((match) => {
              const isSelected = selectedMatch.id === match.id;
              const ended = ENDED_RESULTS[match.id];
              if (ended) {
                return (
                  <div key={match.id} className="w-full p-4 rounded-2xl text-left border bg-gray-100 border-gray-300 opacity-70 flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[9px] font-sans font-extrabold text-emerald-600 uppercase tracking-widest block leading-none">✓ ENDED ({ended.score}) — {ended.scorerNames.join(", ")}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🇧🇦</span>
                        <span className="font-sans font-black text-gray-700">BIH</span>
                        <span className="text-xs font-mono text-gray-400">vs</span>
                        <span className="text-xl">{match.opponentFlag}</span>
                        <span className="font-sans font-black text-gray-800">{match.opponent}</span>
                      </div>
                      {/* IPFS CIDs for scorer cards */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ended.scorerIds.map(sid => {
                          const s = STICKERS.find(st => st.id === sid);
                          if (!s) return null;
                          const folder = s.type === StickerType.SPECIAL ? "special_collection" : "players";
                          const cid = `${IPFS_CID}/components/${folder}/${s.imageFile}`;
                          return (
                            <a key={sid} href={`https://${IPFS_CID}.ipfs.dweb.link/components/${folder}/${s.imageFile}`} target="_blank" rel="noopener noreferrer"
                              className="text-[8px] font-mono bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-100 transition truncate max-w-[140px]"
                              title={cid}>
                              ⛓ {s.name.split(" ").slice(-1)[0]} · {cid.slice(0, 20)}…
                            </a>
                          );
                        })}
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
                  className={`w-full p-4 rounded-2xl text-left border transition relative flex items-center justify-between group cursor-pointer ${match.id === "match-wc26-usa-playoff"
                    ? isSelected
                      ? "bg-gradient-to-r from-blue-50 to-red-50 border-[#002F6C] shadow-md ring-2 ring-[#002F6C]/20"
                      : "bg-gradient-to-r from-blue-50/50 to-red-50/50 hover:from-blue-50 hover:to-red-50 border-blue-300 hover:border-blue-500"
                    : isSelected
                      ? "bg-white border-[#002F6C] shadow-md ring-2 ring-[#002F6C]/10"
                      : "bg-[#fcfbf7] hover:bg-white border-gray-300 hover:border-gray-500"
                    }`}
                >
                  <div className="space-y-2 flex-1">
                    {match.id === "match-wc26-usa-playoff" && (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                        <Trophy className="h-2.5 w-2.5" /><span>PLAYOFF — KO</span>
                      </span>
                    )}
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
                    {/* Squad IPFS CIDs */}
                    {isSelected && (
                      <div className="flex flex-wrap gap-1 mt-1.5 border-t border-gray-200 pt-1.5">
                        {match.squadIds.slice(0, 4).map(sid => {
                          const s = STICKERS.find(st => st.id === sid);
                          if (!s) return null;
                          const folder = s.type === StickerType.SPECIAL ? "special_collection" : "players";
                          return (
                            <a key={sid} href={`https://${IPFS_CID}.ipfs.dweb.link/components/${folder}/${s.imageFile}`} target="_blank" rel="noopener noreferrer"
                              className="text-[8px] font-mono bg-[#002F6C]/5 border border-[#002F6C]/20 text-[#002F6C] px-1 py-0.5 rounded hover:bg-[#002F6C]/10 transition truncate max-w-[120px]"
                              title={`IPFS: ${IPFS_CID}/components/${folder}/${s.imageFile}`}>
                              ⛓ {s.name.split(" ").slice(-1)[0]}
                            </a>
                          );
                        })}
                        <span className="text-[8px] text-gray-400 self-center">+{match.squadIds.length - 4} more</span>
                      </div>
                    )}
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0 ml-2 ${isSelected ? "bg-[#002F6C] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
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
                        onClick={() => checkRealMatchResult(bet)}
                        disabled={simulatingBetId !== null}
                        className={`py-2 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center space-x-1.5 cursor-pointer ${simulatingBetId !== null
                          ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                          : "bg-[#002F6C]/10 border border-[#002F6C]/20 text-[#002F6C] hover:bg-[#002F6C] hover:text-white"
                          }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Check Real Match Result</span>
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
