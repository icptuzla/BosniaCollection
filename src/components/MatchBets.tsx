import React, { useState, useEffect } from "react";
import { Play, Calendar, Clock, MapPin, Award, Lock, Trophy, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
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

  const t = UI_TRANSLATIONS[lang];

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
      setErrorMsg(lang === "BS" 
        ? "Prvo povežite Vaš virtuelni novčanik za zaključavanje Metaplex pametnog ugovora!" 
        : "Please connect your Solflare mock wallet first to confirm Metaplex asset lock!");
      return;
    }

    if (betStickerId === -1) {
      setErrorMsg(lang === "BS" 
        ? "Odaberite nezalijepljenu sličicu iz kesice kao depozit za prognozu!" 
        : "Please select a physical unpasted sticker from your pouch to serve as escrow collateral!");
      return;
    }

    // Double check collection is available and sticker exists
    const record = collection.find(c => c.stickerId === betStickerId);
    if (!record || record.count <= 0 || record.pasted) {
      setErrorMsg(lang === "BS" 
        ? "Ta sličica više nije dostupna u Vašoj kesici!" 
        : "Sticker is no longer available in your pouch!");
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
    setSuccessMsg(lang === "BS"
      ? `✓ Prognoza uplaćena! Sličica ${selectedPlayer?.name} (ID: B-WC26-${betStickerId}) je položena u Metaplex zalog. Prognoza: BIH ${predHome} - ${predAway} ${selectedMatch.opponent}`
      : `✓ Bet placed! Locked ${selectedPlayer?.name} (MINT ID: B-WC26-${betStickerId}) in Metaplex Escrow Contract. Predicted score: BIH ${predHome} - ${predAway} ${selectedMatch.opponent}`);
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

    const eventsPool = lang === "BS" ? [
      "Edin Džeko dobija vazdušni duel! Spektakularan šut glavom, ali pogađa stativu!",
      "Sjajan slobodan udarac zmajeva, ali protivnički golman brani u zadnji čas!",
      "Ermedin Demirović dobija žuti karton nakon oštrog starta na sredini terena.",
      "BHFanaticos pale baklje na tribinama, zaglušujuća atmosfera i plavo-žuti talas nosi momke!",
      "Opasna kontratek protivnika po krilu, ali Kolašinac blokira i šalje loptu u korner!",
      "Benjamin Tahirović šalje sjajan pas kroz odbranu u šesnaesterac.",
      "Amar Dedić prolazi trojicu igrača po krilu i šalje odličan centaršut!"
    ] : [
      "Edin Džeko wins a powerful air battle! He hits the post!",
      "Miralem Pjanić launches a brilliant curved free kick! Perfect curl but keeper saves!",
      "Ermedin Demirović gets a yellow card after a robust tackle.",
      "The Bosnian BHFanaticos fans are lighting flares, creating a wall of golden heat support!",
      "The opponent triggers a dangerous counter-attack from the flank, blocked by Kolašinac!",
      "Benjamin Tahirović releases a high-speed through-ball to the box.",
      "Amar Dedić sprints down the wing and whipped an amazing cross!"
    ];

    let currentHomeGoals = 0;
    let currentAwayGoals = 0;

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + 1;
        let logText = "";
        
        if (next === 1) {
          logText = lang === "BS" 
            ? `⏱️ 1' Počinje utakmica na stadionu ${targetMatch.stadium}. Zmajevi igraju u plavo-žutim dresovima!`
            : `⏱️ 1' Kickoff! Match begins at ${targetMatch.stadium}. Zmajevi are in their blue & gold armor!`;
          setSimLog([logText]);
        } else if (next === 2) {
          logText = `⏱️ 22' ${eventsPool[Math.floor(Math.random() * eventsPool.length)]}`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 3) {
          // Score 1st goal
          if (Math.random() > 0.4) {
            currentHomeGoals += 1;
            logText = lang === "BS"
              ? `⚽ 41' GOOOL!!! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}! Edin Džeko zakucava loptu glavom u gornji ugao! Stadion gori!`
              : `⚽ 41' Goal!!! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}! Edin Džeko converts a spectacular header into the bottom corner! Stadium erupts!`;
          } else {
            currentAwayGoals += 1;
            logText = lang === "BS"
              ? `⚽ 38' Gol za selekciju ${targetMatch.opponent}! ${targetMatch.opponent} ${currentAwayGoals} - ${currentHomeGoals} BIH. Odbijena lopta vara Vasilja.`
              : `⚽ 38' Goal for ${targetMatch.opponent}! ${targetMatch.opponent} ${currentAwayGoals} - ${currentHomeGoals} BIH. A deflected shot catches Vasilj off-guard.`;
          }
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 4) {
          logText = lang === "BS"
            ? `⏱️ 45+2' Kraj prvog poluvremena. Treneri spremaju nove taktičke zamisli.`
            : `⏱️ 45+2' Half-time whistle blown. Managers tactical adjustments incoming.`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 5) {
          logText = `⏱️ 67' ${eventsPool[Math.floor(Math.random() * eventsPool.length)]}`;
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 6) {
          if (Math.random() > 0.5) {
            currentHomeGoals += 1;
            logText = lang === "BS"
              ? `⚽ 81' GOOOOOOL!!! Ermedin Demirović prima vanserijski pas i šalje projektil u mrežu! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}!`
              : `⚽ 81' GOAAAL!!! Ermedin Demirović receives a sleek backheel assist and bangs it in! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}!`;
          } else if (Math.random() > 0.6) {
            currentAwayGoals += 1;
            logText = lang === "BS"
              ? `⚽ 85' Gol za selekciju ${targetMatch.opponent}! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}. Odličan šut iz blizine.`
              : `⚽ 85' Goal for ${targetMatch.opponent}! BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}. Perfect close-range strike.`;
          } else {
            logText = lang === "BS"
              ? `⏱️ 88' Zadnji napadi! Bedem reprezentacije Bosne i Hercegovine rješava sve teške ubačaje!`
              : `⏱️ 88' Tense final minutes! Bosnia's wall is repelling corner kicks after corner kicks!`;
          }
          setSimLog(prevLogs => [...prevLogs, logText]);
        } else if (next === 7) {
          logText = lang === "BS"
            ? `🏁 90' Kraj utakmice! Konačni rezultat: BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}. Hvala svim fer-plej navijačima!`
            : `🏁 90' Full-time! Final score: BIH ${currentHomeGoals} - ${currentAwayGoals} ${targetMatch.opponent}. Celebrating sportsmanship in the true spirit of World Cup 2026.`;
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
      osc.frequency.setValueAtTime(won ? 523.25 : 150, audioCtx.currentTime); 
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
      const updatedCollection = [...collection];
      const matchRec = updatedCollection.find(c => c.stickerId === bet.betStickerId);
      if (matchRec) {
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
        
      alert(lang === "BS" 
        ? `🎉 ČESTITAMO! Vaša prognoza je tačna! Pametni ugovor je oslobodio depozit i dodijelio Vam duplu sličicu te džekpot od 2.0 SOL!`
        : `🎉 Congratulations! Your prediction was exact! Escrow released containing your locked card plus 1 bonus duplicate card and 2.0 SOL jackpot!`);
    } else {
      updatedBets[index] = {
        ...bet,
        status: "LOST",
        actualHomeGoals: simFinalResult.home,
        actualAwayGoals: simFinalResult.away
      };
      alert(lang === "BS"
        ? `😢 Netačna prognoza. Kolateral je likvidiran u zalogu. Probajte ponovo i izoštrite sportska čula!`
        : `😢 Incorrect prediction. Escrow was cleared, and the collaterial sticker was liquidated. Try again to polish your strategic foresight!`);
    }

    saveBetsList(updatedBets);
    setSimulatingBetId(null);
    setSimFinalResult(null);
    setSimLog([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
        
      {/* Immersive Header Banner */}
      <div className="bg-gradient-to-br from-surface-2 to-surface p-6 rounded-3xl border border-border text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,205,0,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gold text-base rounded-full text-[11px] font-sans font-black uppercase tracking-wider">
            <Trophy className="h-3 w-3 animate-pulse" />
            <span>{t.predictionsTitle}</span>
          </div>
          <h2 className="text-3xl font-sans font-black tracking-tighter uppercase leading-none mt-1 text-white">
            {lang === "BS" ? "Klađenje Sličicama" : "Metaplex NFT Card Betting"}
          </h2>
          <p className="text-xs font-sans text-text-muted leading-relaxed mt-1.5">
            {t.predictionsDesc}
          </p>
        </div>

        <div className="shrink-0 bg-surface-3/50 border border-gold/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center w-40 z-10">
          <span className="text-[11px] font-sans font-black uppercase text-gold leading-none">{lang === "BS" ? "NAGRADNI FOND" : "JACKPOT POOL"}</span>
          <span className="text-2xl font-mono font-black text-white mt-1">+2.0 SOL</span>
          <span className="text-[11px] font-sans text-text-muted font-semibold block mt-1">{lang === "BS" ? "+1 Dupla sličica" : "+1 Card Copy"}</span>
        </div>
      </div>

      {/* Grid: Matches Selector on Left, Predict/Tactics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
        {/* Left 5 cols: Game schedule picker */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-sans font-black text-xs text-text-muted uppercase tracking-wider flex items-center space-x-1.5 leading-none">
            <Calendar className="h-4 w-4" />
            <span>{lang === "BS" ? "Izaberite utakmicu zmajeva" : "Select Group Match"}</span>
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
                      ? "bg-surface border-primary ring-1 ring-primary/30"
                      : "bg-surface-2 hover:bg-surface-3 border-border hover:border-border-hover"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <span className="text-[11px] font-sans font-extrabold text-text-dim uppercase tracking-widest block leading-none">
                      {lang === "BS" ? match.stageBS : match.stage}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🇧🇦</span>
                      <span className="font-sans font-black text-text">BIH</span>
                      <span className="text-xs font-mono text-text-dim">vs</span>
                      <span className="text-xl">{match.opponentFlag}</span>
                      <span className="font-sans font-black text-text">{match.opponent}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-text-muted">
                      <span className="flex items-center space-x-1 leading-none">
                        <Clock className="h-3 w-3 text-text-dim" />
                        <span>{match.timestamp.split(" - ")[0]}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Select Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary text-white" : "bg-surface-3 text-text-dim group-hover:bg-surface-3"
                  }`}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 cols: Possible starting 11 tactical projection & Bet Confirmation */}
        <div className="lg:col-span-7 space-y-6 bg-surface border border-border p-6 rounded-2xl">
            
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div>
              <span className="text-[11px] font-sans font-black text-text-dim tracking-wider block uppercase leading-none">{lang === "BS" ? "PROGNOZIRANI SASTAV" : "TACTICAL MATRIX"}</span>
              <h3 className="text-xl font-sans font-black text-text leading-none mb-1 mt-1.5">
                {lang === "BS" ? `Moguća ekipa protiv selekcije: ${selectedMatch.opponent}` : `Possible Squad vs ${selectedMatch.opponent}`}
              </h3>
              <p className="text-xs font-sans text-text-muted flex items-center space-x-1.5 mt-1">
                <MapPin className="h-3 w-3 text-text-dim" />
                <span>{selectedMatch.stadium} ({selectedMatch.city})</span>
              </p>
            </div>
            
            <span className="text-xs font-mono bg-gold/15 border border-gold/30 text-gold px-2.5 py-1 rounded font-bold self-start">
              Odds: {selectedMatch.defaultOdds.split(" | ")[2]}
            </span>
          </div>

          {/* Roster projection */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-sans font-bold text-text-dim tracking-wider uppercase block">{lang === "BS" ? "PROJEKTOVANIH PRVIH XI" : "PROJECTED STARTING ELEVEN"}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedMatch.squadIds.map((pid) => {
                const p = STICKERS.find(s => s.id === pid);
                if (!p) return null;
                return (
                  <div key={p.id} className="p-2 bg-surface-2 border border-border rounded-xl flex items-center space-x-2">
                    <span className="font-sans text-[11px] font-black w-6 h-6 bg-primary text-white rounded-md flex items-center justify-center shrink-0 leading-none">
                      {p.number}
                    </span>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs font-sans font-black text-text truncate leading-none mb-0.5">{p.name.split(" ").slice(-1)[0]}</p>
                      <p className="text-[11px] font-sans font-bold text-text-muted uppercase tracking-tight truncate leading-none">{p.role} • {p.club}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handlePlaceBet} className="pt-4 border-t border-border space-y-4">
            <h4 className="text-[11px] font-sans font-black text-text-dim tracking-wider uppercase block leading-none">{lang === "BS" ? "UNOS PROGNOZE & ODABIR DEPOZITA" : "PREDICTION SCORE & ESCROW COLLATERAL"}</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Score predict dials */}
              <div className="bg-surface-2 border border-border rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-sans font-bold text-text-dim block uppercase leading-none">{lang === "BS" ? "PROGNOZA GOLOVA" : "PREDICT MATCH SCORE"}</span>
                
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="text-xs font-sans font-black text-text-muted block mb-1">BIH Goals</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPredHome(prev => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-surface-3 border border-border hover:bg-surface-3 flex items-center justify-center font-bold text-text cursor-pointer text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-xl font-mono font-black text-gold">{predHome}</span>
                      <button
                        type="button"
                        onClick={() => setPredHome(prev => Math.min(10, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-surface-3 border border-border hover:bg-surface-3 flex items-center justify-center font-bold text-text cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-border" />

                  <div className="text-center">
                    <span className="text-xs font-sans font-black text-text-muted block mb-1">{selectedMatch.opponent} Goals</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPredAway(prev => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-surface-3 border border-border hover:bg-surface-3 flex items-center justify-center font-bold text-text cursor-pointer text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-xl font-mono font-black text-gold">{predAway}</span>
                      <button
                        type="button"
                        onClick={() => setPredAway(prev => Math.min(10, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-surface-3 border border-border hover:bg-surface-3 flex items-center justify-center font-bold text-text cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collateral Selection dropdown */}
              <div className="bg-surface-2 border border-border rounded-2xl p-4 space-y-3 text-left">
                <span className="text-[11px] font-sans font-bold text-text-dim block uppercase leading-none">{lang === "BS" ? "UPLATA DEPOZITA (ZALOG)" : "ESCROW COVER (COLLATERAL)"}</span>
                
                <div>
                  <label className="text-[11px] font-sans font-bold text-text-muted uppercase block mb-1 leading-none">{lang === "BS" ? "SLIČICE IZ KESICE" : "UNPASTED BAG SELECTOR"}</label>
                  {bettableStickers.length === 0 ? (
                    <div className="p-2.5 bg-danger/10 border border-danger/30 rounded-xl text-[11px] sm:text-xs font-sans text-danger font-semibold leading-relaxed mt-1">
                      {lang === "BS" 
                        ? "Nemate slobodnih sličica u kesici! Kupite paketiće u prodavnici kako biste obezbijedili depozit."
                        : "No unpasted duplicates available! Acquire booster packs to load card escrow collateral."}
                    </div>
                  ) : (
                    <select
                      value={betStickerId}
                      onChange={(e) => setBetStickerId(Number(e.target.value))}
                      className="w-full text-xs font-sans bg-surface-2 border border-border hover:border-border-hover rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-text cursor-pointer mt-1"
                    >
                      <option value={-1}>{lang === "BS" ? "-- Izaberite deponovanu sličicu --" : "-- Select Duplication Card --"}</option>
                      {bettableStickers.map((item) => (
                        <option key={item.stickerId} value={item.stickerId}>
                          #{item.player?.number} {item.player?.name} ({item.count} {lang === "BS" ? "komad" : "free copy"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

            </div>

            {/* Error or Success alerts */}
            {errorMsg && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl flex items-center space-x-2 text-xs text-danger font-semibold leading-snug">
                <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-xl flex items-center space-x-2 text-xs text-success font-semibold leading-snug">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action submit button */}
            <button
              type="submit"
              disabled={bettableStickers.length === 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-sans font-black uppercase text-xs tracking-wider transition-all duration-150 relative overflow-hidden flex items-center justify-center space-x-2 cursor-pointer ${
                bettableStickers.length === 0
                  ? "bg-surface-3 text-text-dim border border-border cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-primary-dim hover:opacity-95 text-white"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>{lang === "BS" ? "Deponuj sličicu i plati prognozu" : "LOCK CARD & PLACE SCORE BET"}</span>
            </button>
          </form>

        </div>
      </div>

      {/* active escrowed bets logs */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-sans font-black text-sm text-text uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-border pb-3 leading-none">
          <Award className="h-5 w-5 text-gold" />
          <span>{lang === "BS" ? `Aktivne prognoze na čekanju (${bets.length})` : `Active Escrow Live Predictions Arena (${bets.length})`}</span>
        </h3>

        {bets.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <Trophy className="h-10 w-10 text-text-dim mx-auto mb-3" />
            <p className="text-sm font-sans text-text-muted text-center leading-relaxed">
              {lang === "BS"
                ? "Trenutno nema aktivnih prognoza u Metaplex ledger zapisu. Odaberite utakmicu i postavite prognozu iznad!"
                : "No active predictions found in Metaplex Solflare Ledger. Select a match and place a bet!"}
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
                <div key={bet.id} className="border border-border rounded-2xl p-5 bg-surface-2 flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
                  
                  {/* Left: Predict Info */}
                  <div className="space-y-2 flex-grow text-left">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full font-black uppercase border tracking-wider leading-none ${
                        bet.status === "ACTIVE"
                          ? "bg-warning/15 text-warning border-warning/30"
                          : bet.status === "WON"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-danger/15 text-danger border-danger/30"
                      }`}>
                        {bet.status} ESCROW
                      </span>
                      <span className="text-[11px] font-mono text-text-dim">TXREF-ID: {bet.id.toUpperCase()}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-sans font-black text-base text-text leading-none">
                        BIH vs {match.opponent} {match.opponentFlag}
                      </span>
                      <span className="text-text-dim mr-1">•</span>
                      <span className="text-sm font-sans font-black text-gold leading-none">
                        {lang === "BS" ? "Prognoza:" : "Predicted Score:"} {bet.predHomeGoals} - {bet.predAwayGoals}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-text-muted">
                      <span className="flex items-center space-x-1 leading-none">
                        <span className="font-sans font-bold text-text-muted">{lang === "BS" ? "Deponovana sličica:" : "Locked Asset:"}</span>
                        <span className="font-sans font-black text-gold">#{card.number} {card.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Simulation stream overlay */}
                  {isSimulating && (
                    <div className="flex-grow max-w-lg bg-black border border-border p-4 rounded-xl text-left text-xs font-mono text-success space-y-2 transition-all">
                      <div className="flex justify-between items-center text-[11px] text-text-dim font-bold tracking-widest uppercase border-b border-border pb-1.5 animate-pulse">
                        <span>{lang === "BS" ? "LIVE komentator utakmice" : "LIVE commentary matchday"}</span>
                        <span>{Math.round((simProgress / 7) * 100)}% PLAYED</span>
                      </div>
                      <div className="h-24 overflow-y-auto space-y-1.5 select-none pr-1 scrollbar-thin">
                        {simLog.map((log, i) => (
                          <p key={i} className="leading-relaxed animate-fade-in">{log}</p>
                        ))}
                      </div>
                      <div className="w-full bg-surface-3 h-1 rounded-full overflow-hidden">
                        <div className="bg-success h-full transition-all duration-300" style={{ width: `${(simProgress / 7) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Right: simulation actions */}
                  <div className="shrink-0 flex items-center space-x-4 font-sans">
                    {bet.status === "ACTIVE" && !isSimulating && (
                      <button
                        onClick={() => startSimulation(bet)}
                        disabled={simulatingBetId !== null}
                        className={`py-2 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
                          simulatingBetId !== null
                            ? "bg-surface-3 text-text-dim border border-border cursor-not-allowed"
                            : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{lang === "BS" ? "Simuliraj Utakmicu" : "Simulate Match Outcome"}</span>
                      </button>
                    )}

                    {isSimulating && simProgress === 7 && (
                      <button
                        onClick={() => claimBetReward(bet, idx)}
                        className="py-2.5 px-5 rounded-xl bg-success hover:bg-success/90 text-base font-black text-xs uppercase tracking-wider transition flex items-center space-x-1 animate-bounce cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>{lang === "BS" ? "Preuzmi ishod zaloga" : "Claim Escrow Outcome"}</span>
                      </button>
                    )}

                    {bet.status !== "ACTIVE" && (
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-text-dim block uppercase leading-none">{lang === "BS" ? "KONAČAN ISHOD" : "ACTUAL RESULT"}</span>
                        <span className="text-sm sm:text-base font-mono font-black text-text block mt-1">
                          BIH {bet.actualHomeGoals} - {bet.actualAwayGoals} {match.opponent}
                        </span>
                        <p className={`text-xs font-bold mt-1 ${bet.status === "WON" ? "text-success" : "text-danger"}`}>
                          {bet.status === "WON" 
                            ? (lang === "BS" ? "🎉 Tačna prognoza! +2.0 SOL" : "🎉 Exact Match Won! +2.0 SOL") 
                            : (lang === "BS" ? "Likvidiran zalog" : "Liquidated Escrow")}
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
