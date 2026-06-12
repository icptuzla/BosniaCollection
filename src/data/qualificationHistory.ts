export interface MatchResult {
  date: string;
  opponent: string;
  score: string;
  round: string;
  scorers: string;
  isWin: boolean;
  isPenalty?: boolean;
}

export interface OpponentMatchup {
  opponent: string;
  date: string;
  stadium: string;
  city: string;
}

export interface QualificationHistoryType {
  overview: {
    nickname: string;
    fifaRanking: string;
    captain: string;
    headCoach: string;
    homeStadium: string;
  };
  details: string;
  groupStandings: {
    team: string;
    points: number;
    stats: string;
    status: string;
  }[];
  playoffs: MatchResult[];
  groupMatches: OpponentMatchup[];
}

export const qualificationHistory: QualificationHistoryType = {
  overview: {
    nickname: "Zmajevi (The Dragons)",
    fifaRanking: "71st (as of January 2026)",
    captain: "Edin Džeko (All-time top scorer: 72 goals)",
    headCoach: "Sergej Barbarez",
    homeStadium: "Bilino Polje Stadium (Zenica)"
  },
  details: "Bosnia and Herzegovina secured a historic qualification for their second-ever FIFA World Cup by conquering UEFA Playoff Path A in stunning fashion, including an legendary penalty shootout victory against Italy in Zenica.",
  groupStandings: [
    { team: "Austria", points: 19, stats: "5W - 4D - 1L", status: "Qualified Directly" },
    { team: "Bosnia & Herzegovina", points: 17, stats: "5W - 2D - 1L", status: "Advanced to Playoffs" },
    { team: "Romania", points: 13, stats: "4W - 1D - 3L", status: "Playoffs (via Nations League)" },
    { team: "Cyprus", points: 8, stats: "2W - 2D - 4L", status: "Eliminated" },
    { team: "San Marino", points: 0, stats: "0W - 0D - 8L", status: "Eliminated" }
  ],
  playoffs: [
    {
      date: "March 26, 2026",
      opponent: "Wales",
      score: "1 - 0",
      round: "Playoff Semifinal (Cardiff)",
      scorers: "Armin Gigović (14')",
      isWin: true
    },
    {
      date: "March 31, 2026",
      opponent: "Italy",
      score: "1 - 1 (4-1 Pens)",
      round: "Playoff Final (Zenica)",
      scorers: "Haris Tabaković (79')",
      isWin: true,
      isPenalty: true
    }
  ],
  groupMatches: [
    {
      opponent: "Canada (Co-hosts)",
      date: "June 12, 2026",
      stadium: "BMO Field",
      city: "Toronto"
    },
    {
      opponent: "Switzerland",
      date: "June 18, 2026",
      stadium: "SoFi Stadium",
      city: "Inglewood, CA"
    },
    {
      opponent: "Qatar",
      date: "June 24, 2026",
      stadium: "Lumen Field",
      city: "Seattle"
    }
  ]
};
