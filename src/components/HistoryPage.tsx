import React from "react";
import { qualificationHistory } from "../data/qualificationHistory";
import { Trophy, Calendar, Shield, Award, MapPin, Zap, Star } from "lucide-react";
import { Language, UI_TRANSLATIONS } from "../data/translations";

interface HistoryPageProps {
  lang: Language;
}

export default function HistoryPage({ lang }: HistoryPageProps) {
  const { overview, playoffs, groupMatches } = qualificationHistory;
  const t = UI_TRANSLATIONS[lang];

  const localizedDetails = lang === "BS" 
    ? "Bosna i Hercegovina je osigurala istorijski plasman na svoje drugo Svjetsko prvenstvo u fudbalu kroz epski trijumf u UEFA baražu, uključujući legendarnu pobjedu na penale protiv Italije u krcatom zeničkom Bilinom Polju!"
    : "Bosnia and Herzegovina secured a historic qualification for their second-ever FIFA World Cup by conquering UEFA Playoff Path A in stunning fashion, including an legendary penalty shootout victory against Italy in Zenica.";

  const localizedStanding = [
    { team: lang === "BS" ? "Austrija" : "Austria", points: 19, stats: "5P - 4N - 1Z", status: lang === "BS" ? "Direktan Plasman" : "Qualified Directly" },
    { team: lang === "BS" ? "Bosna i Hercegovina" : "Bosnia & Herzegovina", points: 17, stats: "5P - 2N - 1Z", status: lang === "BS" ? "Prošli u Baraž" : "Advanced to Playoffs" },
    { team: lang === "BS" ? "Rumunija" : "Romania", points: 13, stats: "4P - 1N - 3Z", status: lang === "BS" ? "Baraž (Liga Nacija)" : "Playoffs (via Nations League)" },
    { team: lang === "BS" ? "Kipar" : "Cyprus", points: 8, stats: "2P - 2N - 4Z", status: lang === "BS" ? "Eliminisani" : "Eliminated" },
    { team: lang === "BS" ? "San Marino" : "San Marino", points: 0, stats: "0P - 0N - 8Z", status: lang === "BS" ? "Eliminisani" : "Eliminated" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-text font-sans">
        
      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-primary to-primary-dim text-white p-6 md:p-8 rounded-3xl overflow-hidden text-left">
        {/* Subtle decorative soccer goals */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4">
          <Trophy className="w-48 h-48 text-gold/10" />
        </div>

        <div className="relative z-10 space-y-2 animate-fade-in">
          <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-gold uppercase block">
            {lang === "BS" ? "ISTORIJSKI USPJEH" : "HISTORIC ACHIEVEMENT"}
          </span>
          <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight uppercase leading-none text-gold">
            {t.historyTitle}
          </h2>
          <p className="max-w-2xl text-xs md:text-sm text-white/80 leading-relaxed font-normal">
            {localizedDetails}
          </p>
        </div>
      </div>

      {/* Grid: Overview Details & Group B Matchups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 text-left">
          <h3 className="font-sans font-black text-lg text-text uppercase tracking-wide mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gold shrink-0" />
            <span>{lang === "BS" ? "Profil Reprezentacije" : "National Team Profile"}</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="pb-3 border-b border-border flex justify-between items-center">
              <span className="font-bold text-text-muted uppercase tracking-wider">{lang === "BS" ? "NADIMAK:" : "NICKNAME:"}</span>
              <span className="text-text font-bold">{lang === "BS" ? "Zmajevi" : overview.nickname}</span>
            </div>
            
            <div className="pb-3 border-b border-border flex justify-between items-center">
              <span className="font-bold text-text-muted uppercase tracking-wider">{lang === "BS" ? "FIFA RANKING:" : "FIFA RANKING:"}</span>
              <span className="text-text font-bold">{lang === "BS" ? "71. mjesto (od Januara 2026)" : overview.fifaRanking}</span>
            </div>

            <div className="pb-3 border-b border-border flex flex-col space-y-1">
              <span className="font-bold text-text-muted uppercase tracking-wider">{lang === "BS" ? "KAPITEN I LEGENDA:" : "CAPTAIN & LEGEND:"}</span>
              <span className="text-text font-bold flex items-center">
                <Star className="h-3.5 w-3.5 text-gold mr-1 inline animate-pulse" />
                {lang === "BS" ? "Edin Džeko (Najbolji strijelac ikada: 72 gola)" : overview.captain}
              </span>
            </div>

            <div className="pb-3 border-b border-border flex justify-between items-center">
              <span className="font-bold text-text-muted uppercase tracking-wider">{lang === "BS" ? "SELEKTOR:" : "HEAD COACH:"}</span>
              <span className="text-text font-bold">{overview.headCoach}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-text-muted uppercase tracking-wider">{lang === "BS" ? "DOMAĆI TEREN:" : "HOME GROUND:"}</span>
              <span className="text-text font-bold flex items-center">
                <MapPin className="h-3.5 w-3.5 text-primary mr-0.5" />
                {lang === "BS" ? "Stadion Bilino Polje (Zenica)" : overview.homeStadium}
              </span>
            </div>
          </div>
        </div>

        {/* Group stage matchups card */}
        <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 text-left">
          <h3 className="font-sans font-black text-lg text-text uppercase tracking-wide mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gold shrink-0" />
            <span>{lang === "BS" ? "Raspored Grupe B na S.P." : "Group B World Cup Schedule"}</span>
          </h3>

          <div className="space-y-3">
            {groupMatches.map((match, i) => (
              <div key={i} className="bg-surface-2 border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="text-left space-y-1">
                  <div className="text-[11px] font-bold text-text-dim font-mono tracking-wider uppercase">
                    {lang === "BS" ? (match.date === "June 12, 2026" ? "12. Juni 2026." : match.date === "June 18, 2026" ? "18. Juni 2026." : "24. Juni 2026.") : match.date}
                  </div>
                  <div className="text-xs font-sans font-black text-text">
                    Bosna i Hercegovina vs. {match.opponent.replace(" (Co-hosts)", "")}
                  </div>
                  <div className="text-[11px] text-text-muted flex items-center">
                    <MapPin className="h-3 w-3 mr-0.5 inline text-text-dim" />
                    <span>{match.stadium}, {match.city}</span>
                  </div>
                </div>
                <span className="text-[11px] font-sans font-extrabold px-2 py-1 rounded bg-gold/15 text-gold border border-gold/30 shrink-0 uppercase tracking-wider">
                  {lang === "BS" ? "Uživo Juni '26" : "Live June '26"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dramatic Playoffs Timeline */}
      <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 text-left">
        <h3 className="font-sans font-black text-lg text-text uppercase tracking-wide mb-4 flex items-center space-x-2 animate-fade-in">
          <Award className="h-5 w-5 text-gold" />
          <span>{lang === "BS" ? "Istorijska Drama UEFA Baraža" : "UEFA Playoffs Path A Drama"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playoffs.map((playoff, idx) => (
            <div key={idx} className="relative bg-surface-2 border border-gold/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold bg-primary text-white px-2 py-0.5 rounded font-mono">
                  {lang === "BS" ? (playoff.round.includes("Semifinal") ? "Polufinale Baraža (Cardiff)" : "Finale Baraža (Zenica)") : playoff.round}
                </span>
                <span className="text-[11px] text-text-dim font-semibold font-mono">
                  {lang === "BS" ? (playoff.date === "March 26, 2026" ? "26. Mart 2026." : "31. Mart 2026.") : playoff.date}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-border">
                <span className="text-xs font-black text-text uppercase">
                  {lang === "BS" ? (playoff.opponent === "Wales" ? "Vels" : "Italija") : playoff.opponent}
                </span>
                <span className="text-base font-mono font-black px-2.5 py-0.5 bg-surface border border-border rounded-lg text-success">
                  {playoff.score}
                </span>
              </div>

              <div className="text-[11px] font-sans text-text-muted">
                <span className="font-sans font-bold text-text mr-1">{lang === "BS" ? "Strijelci:" : "Scorers:"}</span>
                {playoff.scorers}
              </div>

              {playoff.isPenalty && (
                <div className="text-[11px] font-sans font-black text-center bg-gold/15 text-gold border border-gold/30 rounded p-1.5 animate-pulse uppercase tracking-wider leading-none">
                  {lang === "BS" ? "📢 ISTORIJSKA POBJEDA NAKON BOLJEG IZVOĐENJA PENALA!" : "📢 First Ever Playoff Shootout Win For BIH!"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Standings Stage H */}
      <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 text-left">
        <h3 className="font-sans font-black text-lg text-text uppercase tracking-wide mb-4 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-gold" />
          <span>{lang === "BS" ? "Tabela Kvalifikacione Grupe H" : "UEFA Group H Qualification Standings"}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-border text-text-muted font-bold uppercase tracking-wider">
                <th className="py-2.5">{lang === "BS" ? "Pozicija i Selekcija" : "Pos & Country"}</th>
                <th className="py-2.5 text-center">{lang === "BS" ? "Omjer" : "Record"}</th>
                <th className="py-2.5 text-center">{lang === "BS" ? "Bodovi" : "Points"}</th>
                <th className="py-2.5 text-right">{lang === "BS" ? "Status kvalifikacija" : "Qualification Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {localizedStanding.map((team, idx) => (
                <tr key={idx} className={team.team === "Bosnia & Herzegovina" || team.team === "Bosna i Hercegovina" ? "bg-gold/5 font-bold" : "text-text-muted"}>
                  <td className="py-3 flex items-center space-x-1.5">
                    <span className="font-mono text-text-dim w-4 inline-block">{idx + 1}.</span>
                    <span className={team.team === "Bosnia & Herzegovina" || team.team === "Bosna i Hercegovina" ? "text-gold font-bold" : ""}>
                      {team.team}
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono">{team.stats}</td>
                  <td className="py-3 text-center font-mono font-bold text-primary">{team.points} PTS</td>
                  <td className="py-3 text-right">
                    <span className={`inline-block text-[11px] font-sans font-bold px-2 py-0.5 rounded tracking-wide uppercase leading-none border ${
                      team.status.includes("Qualified") || team.status.includes("Direktan")
                        ? "bg-success/15 text-success border-success/30" 
                        : team.status.includes("Playoffs") || team.status.includes("Baraž")
                        ? "bg-primary/15 text-primary border-primary/30" 
                        : "bg-text-dim/10 text-text-dim border-transparent"
                    }`}>
                      {team.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
