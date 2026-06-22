import { Sticker, StickerType } from "../types";

export const STICKERS: Sticker[] = [
  // ==================== STARTING 11 (Indices 0 - 10) ====================
  {
    id: 1,
    number: "01",
    name: "Nikola Vasilj",
    role: "GK",
    club: "FC St. Pauli",
    birthDate: "02.12.1995",
    height: "193 cm",
    biography: "Starting goalkeeper in the German Bundesliga with St. Pauli. Renowned for incredible reflexes in penalty duels, solid command of the 6-yard box, and spectacular shot-stopping capabilities.",
    stats: {
      overall: 75,
      pace: 74, // Diving
      shooting: 73, // Handling
      passing: 71, // Kicking
      dribbling: 77, // Reflexes
      defending: 45, // Speed
      physicality: 74 // Positioning
    },
    gameRatingRef: "FC26 Rating: 75",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "nikola-vasilj.webp"
  },
  {
    id: 2,
    number: "07",
    name: "Amar Dedić",
    role: "RB / RWB",
    club: "Benfica",
    birthDate: "18.08.2002",
    height: "180 cm",
    biography: "One of the most exciting young right-backs in European football. Possesses raw pace, phenomenal recovery runs, and high tactical flexibility. Already attracting scouts from elite Champions League clubs worldwide.",
    stats: {
      overall: 79,
      pace: 86,
      shooting: 64,
      passing: 74,
      dribbling: 78,
      defending: 75,
      physicality: 79
    },
    gameRatingRef: "FC26 Rating: 79",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-500 via-cyan-800 to-indigo-950",
    imageFile: "Pi_dedic.webp"
  },
  {
    id: 3,
    number: "04",
    name: "Tarik Muharemović",
    role: "CB",
    club: "Sassuolo",
    birthDate: "28.02.2003",
    height: "1.87 m",
    biography: "One of the most perspective defenders in Europe. Trained by Juventus, he rose at Sassuolo to become one of the best young defenders of the Bosnian team.",
    stats: {
      overall: 84,
      pace: 80,
      shooting: 39,
      passing: 65,
      dribbling: 70,
      defending: 88,
      physicality: 83
    },
    gameRatingRef: "FC26 Rating: 84",
    type: StickerType.SPECIAL,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "Muharemovic.webp"
  },
  {
    id: 4,
    number: "03",
    name: "Dennis Hadžikadunić",
    role: "CB",
    club: "Sampdoria",
    birthDate: "09.07.1998",
    height: "191 cm",
    biography: "A brave, physical central defender with excellent positioning. Hadžikadunić plays with heart, blocking shots, winning key slide tackles, and serving as a key wall in the Bosnian defense.",
    stats: {
      overall: 74,
      pace: 68,
      shooting: 35,
      passing: 55,
      dribbling: 51,
      defending: 74,
      physicality: 76
    },
    gameRatingRef: "FC26 Rating: 74",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "hadzikadunic.webp"
  },
  {
    id: 5,
    number: "05",
    name: "Sead Kolašinac",
    role: "CB / LB",
    club: "Atalanta",
    birthDate: "20.06.1993",
    height: "183 cm",
    biography: "Appropriately nicknamed 'The Bosnian Hulk' or 'The Tank'. Kolašinac is a powerhouse defender known for his physically intimidating presence and sheer resilience, having played for Schalke, Arsenal, Marseille, and Europa League winners Atalanta.",
    stats: {
      overall: 78,
      pace: 69,
      shooting: 59,
      passing: 72,
      dribbling: 71,
      defending: 78,
      physicality: 87
    },
    gameRatingRef: "FC26 Rating: 78",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "sead-kolasinac.webp"
  },
  {
    id: 6,
    number: "06",
    name: "Benjamin Tahirović",
    role: "CDM",
    club: "Brondby-IF",
    birthDate: "03.03.2003",
    height: "190 cm",
    biography: "A highly rated young midfield engine, discovered and promoted by José Mourinho at AS Roma before moving to Ajax. Tall, superb under pressure, and highly adept at building attacks from deep positions.",
    stats: {
      overall: 73,
      pace: 66,
      shooting: 58,
      passing: 72,
      dribbling: 70,
      defending: 70,
      physicality: 74
    },
    gameRatingRef: "FC26 Rating: 73",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "benjamin-tahirovic.webp"
  },
  {
    id: 7,
    number: "08",
    name: "Armin Gigović",
    role: "CM",
    club: "Young Boys",
    birthDate: "06.04.2002",
    height: "187 cm",
    biography: "A tactical dynamic midfielder playing in Germany. Combines robust physical presence with elegant pass mechanics, working tirelessly in counter-pressing mechanics representing Bosnia's modern core.",
    stats: {
      overall: 72,
      pace: 71,
      shooting: 59,
      passing: 69,
      dribbling: 71,
      defending: 68,
      physicality: 72
    },
    gameRatingRef: "FC26 Rating: 72",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "Gigovic.webp"

  },
  {
    id: 8,
    number: "19",
    name: "Kerim Alajbegović",
    role: "LW / AM",
    club: "RB Salzburg",
    birthDate: "21.09.2007",
    height: "1.78 m",
    biography: "One of the brightest young prospects from Cologne, Germany, showing exceptional creative versatility at RB Salzburg. A rapid midfielder/winger with amazing dribbling, passing, and clinical shooting ability.",
    stats: {
      overall: 82,
      pace: 89,
      shooting: 87,
      passing: 90,
      dribbling: 85,
      defending: 36,
      physicality: 78
    },
    gameRatingRef: "FC26 Rating: 82",
    type: StickerType.SPECIAL,
    imageTheme: "from-amber-400 via-yellow-800 to-blue-950 animate-pulse bg-[length:200%_200%]",
    imageFile: "kenan-alajbegovic.webp"
  },

  {
    id: 9,
    number: "20",
    name: "Esmir Bajraktarević",
    role: "RW / RM",
    club: "PSV Eindhoven",
    birthDate: "10.03.2005",
    height: "175 cm",
    biography: "The wonderkid of American-Bosnian heritage playing in PSV. His rapid dribbling cuts, insane control logic, and explosive pace made him an immediate fan favorite for the national team's creative future wings.",
    stats: {
      overall: 82,
      pace: 83,
      shooting: 87,
      passing: 90,
      dribbling: 90,
      defending: 41,
      physicality: 70
    },
    gameRatingRef: "FC26 Rating: 82",
    type: StickerType.STANDARD,
    imageTheme: "from-amber-500 via-yellow-600 to-indigo-950",
    imageFile: "esmir-bajraktarevic.webp"
  },
  {
    id: 10,
    number: "10",
    name: "Ermedin Demirović",
    role: "ST",
    club: "VfB Stuttgart",
    birthDate: "25.03.1998",
    height: "187 cm",
    biography: "A high-intensity, power-driven striker representing Bosnia's modern attacking generation. Demirović is a goalscoring machine in the German Bundesliga, showing lethal finishing, tireless workrate, and extreme aerial dominance.",
    stats: {
      overall: 81,
      pace: 78,
      shooting: 80,
      passing: 72,
      dribbling: 76,
      defending: 48,
      physicality: 83
    },
    gameRatingRef: "FC26 Rating: 81",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "Pi_Demirovic.webp"
  },
  {
    id: 11,
    number: "11",
    name: "Edin Džeko",
    role: "ST / Captain",
    club: "Schalke 04",
    birthDate: "17.03.1986",
    height: "193 cm",
    biography: "The greatest Bosnian striker of all time, nicknamed 'The Bosnian Diamond'. Renowned for winning titles with Wolfsburg, Manchester City, and AS Roma. Bosnia's all-time record goalscorer, carrying the hopes of the Zmajevi with unmatched mental toughness.",
    stats: {
      overall: 83,
      pace: 61,
      shooting: 84,
      passing: 73,
      dribbling: 77,
      defending: 45,
      physicality: 76
    },
    gameRatingRef: "FC26 Rating: 83",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "Pi_dzeko.webp"
  },

  // ==================== SUBSTITUTIONS (Indices 11 - 21) ====================
  {
    id: 12,
    number: "22",
    name: "Martin Zlomislić",
    role: "GK",
    club: "NK. Rijeka",
    birthDate: "07.07.1994",
    height: "192 cm",
    biography: "An exceptionally reliable auxiliary shot-stopper with intense international experience. Known for his aerial control and leadership in the penalty area.",
    stats: {
      overall: 72,
      pace: 71,
      shooting: 70,
      passing: 68,
      dribbling: 74,
      defending: 42,
      physicality: 71
    },
    gameRatingRef: "FC26 Rating: 72",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "zlomislic.webp"
  },
  {
    id: 13,
    number: "13",
    name: "Ivan Bašić",
    role: "CAM / CM",
    club: "F.C. Astana",
    birthDate: "30.04.2002",
    height: "180 cm",
    biography: "An exceptionally skillful, high-potential technician. Bašić is noted for his incredible curving shots, precise set-piece deliveries, and smart, flowing attacking support.",
    stats: {
      overall: 72,
      pace: 72,
      shooting: 69,
      passing: 74,
      dribbling: 73,
      defending: 51,
      physicality: 62
    },
    gameRatingRef: "FC26 Rating: 72",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "ivan-basic.webp"
  },
  {
    id: 14,
    number: "14",
    name: "Ivan Šunjić",
    role: "Midfielder",
    club: "Pafos FC",
    birthDate: "22.08.1997",
    height: "184 cm",
    biography: "A rugged, energetic defensive midfielder known for his high physical work rate, robust sliding tackles, and clever positioning under deep pressure.",
    stats: {
      overall: 74,
      pace: 61,
      shooting: 53,
      passing: 72,
      dribbling: 78,
      defending: 77,
      physicality: 82
    },
    gameRatingRef: "FC26 Rating: 74",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "sunjic.webp"
  },
  {
    id: 15,
    number: "18",
    name: "Nikola Katić",
    role: "CB",
    club: "FC Schalke",
    birthDate: "19.07.2001",
    height: "192 cm",
    biography: "An athletic, aggressive strong center back sharpening his craft at Switzerland. Already showing strong interception records and immense potential to lead the generational defence line.",
    stats: {
      overall: 81,
      pace: 72,
      shooting: 45,
      passing: 69,
      dribbling: 70,
      defending: 89,
      physicality: 91
    },
    gameRatingRef: "FC26 Rating: 81",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "nikola-katic.webp"
  },
  {
    id: 16,
    number: "23",
    name: "Ermin Mahmić",
    role: "Midfielder",
    club: "Slovan Liberec",
    birthDate: "20.07.2003",
    height: "1.82m",
    biography: "A talented left-footed deep engine who graduated from Borussia Dortmund's prestigious academy. Gifted with intense spatial agility and clever pass distribution qualities.",
    stats: {
      overall: 71,
      pace: 66,
      shooting: 69,
      passing: 74,
      dribbling: 68,
      defending: 52,
      physicality: 72
    },
    gameRatingRef: "FC26 Rating: 71",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "mahmic.webp"
  },
  {
    id: 17,
    number: "02",
    name: "Nermin Mujakić",
    role: "CLB",
    club: "Antalyspor",
    birthDate: "24.01.1998",
    height: "185 cm",
    biography: "Affectionately called 'The Iron Nermin'. A veteran defensive hero who represents true grit, slide-tackle blocks, and the legendary 2014 world cup qualifying era spirits.",
    stats: {
      overall: 73,
      pace: 56,
      shooting: 40,
      passing: 58,
      dribbling: 54,
      defending: 73,
      physicality: 80
    },
    gameRatingRef: "FC26 Rating: 73",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "mujakic.webp"

  },
  {
    id: 18,
    number: "18",
    name: "Dženis Burnić",
    role: "CM / LM",
    club: "Karlsruher SC",
    birthDate: "22.05.1998",
    height: "181 cm",
    biography: "A talented left-footed deep engine who graduated from Borussia Dortmund's prestigious academy. Gifted with intense spatial agility and clever pass distribution qualities.",
    stats: {
      overall: 71,
      pace: 73,
      shooting: 61,
      passing: 70,
      dribbling: 72,
      defending: 64,
      physicality: 68
    },
    gameRatingRef: "FC26 Rating: 71",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "denis-burnic.webp"
  },
  {

    id: 19,
    number: "28",
    name: "Denis Huseinbašić",
    role: "CM",
    club: "1. FC Köln",
    birthDate: "03.07.2001",
    height: "184 cm",
    biography: "An exceptionally versatile intelligence engine dominating the midfield play for Köln. His box-to-box endurance, timing inside deep runs, and physical ball-recovery make him an absolute lock-in.",
    stats: {
      overall: 74,
      pace: 74,
      shooting: 68,
      passing: 72,
      dribbling: 74,
      defending: 67,
      physicality: 71
    },
    gameRatingRef: "FC26 Rating: 74",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "husejinbasic.webp"
  },
  {

    id: 20,
    number: "27",
    name: "Arjan Malić",
    role: "CB / LB",
    club: "Sturm Graz",
    birthDate: "28.08.2005",
    height: "1.86 m",
    biography: "An emerging youth prospect born in Jesenice, Slovenia, playing for Sturm Graz. His rapid physical maturity, aerial abilities, and clean playing style make him a fantastic defensive option for the national team's future.",
    stats: {
      overall: 68,
      pace: 73,
      shooting: 58,
      passing: 65,
      dribbling: 68,
      defending: 60,
      physicality: 65
    },
    gameRatingRef: "FC26 Rating: 74",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "malic.webp"
  },
  {
    id: 21,
    number: "06",
    name: "Stjepan Radeljić",
    role: "CB",
    club: "HNK Rijeka",
    birthDate: "05.09.1997",
    height: "2.01 m",
    biography: "A towering, physical central defender who stands at 2.01m tall. Playing for HNK Rijeka, Radeljić is dominating in aerial duels and provides crucial safety inside deep defensive structures.",
    stats: {
      overall: 70,
      pace: 61,
      shooting: 52,
      passing: 59,
      dribbling: 52,
      defending: 82,
      physicality: 79
    },
    gameRatingRef: "FC26 Rating: 72",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "stjepan-radeljic.webp"
  },
  {
    id: 22,
    number: "9",
    name: "Samed Baždar",
    role: "Forward",
    club: "Real Zaragoza",
    birthDate: "18.08.2004",
    height: "186 cm",
    biography: "A gifted attacker whose technical intelligence and quick goal instincts have positioned him as one of the most promising young talents in his generation.",
    stats: {
      overall: 70,
      pace: 70,
      shooting: 83,
      passing: 79,
      dribbling: 82,
      defending: 42,
      physicality: 80
    },
    gameRatingRef: "FC26 Rating: 70",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "samed-bazdar.webp"
  },
  {
    id: 23,
    number: "23",
    name: "Haris Tabaković",
    role: "ST",
    club: "Borussia Monchengladbach",
    birthDate: "20.06.1994",
    height: "194 cm",
    biography: "A clinical traditional target-man who was the top goalscorer in Germany's 2. Bundesliga before his move to TSG Hoffenheim. Invaluable target structure inside long-ball aerial schemes.",
    stats: {
      overall: 75,
      pace: 67,
      shooting: 77,
      passing: 60,
      dribbling: 68,
      defending: 33,
      physicality: 82
    },
    gameRatingRef: "FC26 Rating: 75",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "haris.tabakovicpng.webp"
  },
  {
    id: 24,
    number: "12",
    name: "Amir Hadžiahmetović",
    role: "CDM",
    club: "Beşiktaş",
    birthDate: "08.03.1997",
    height: "179 cm",
    biography: "Technical defensive midfielder with excellent vision. A key piece of the central engine room.",
    stats: { overall: 76, pace: 71, shooting: 65, passing: 78, dribbling: 75, defending: 72, physicality: 70 },
    gameRatingRef: "FC26 Rating: 76",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "amir-hadziahmetovic.webp"
  },

  {
    id: 25,
    number: "25",
    name: "Jovo Lukić",
    role: "ST",
    club: "Universitatea Cluj",
    birthDate: "28.11.1998",
    height: "193 cm",
    biography: "A tall, physical target man playing in the Romanian Superliga. Known for his aerial presence and goalscoring instinct, providing a different dimension to the Bosnian attack.",
    stats: {
      overall: 70,
      pace: 65,
      shooting: 72,
      passing: 60,
      dribbling: 65,
      defending: 35,
      physicality: 80
    },
    gameRatingRef: "FC26 Rating: 70",
    type: StickerType.STANDARD,
    imageTheme: "from-blue-600 via-zinc-800 to-indigo-950",
    imageFile: "lukic.webp"
  },

  // ==================== SPECIAL COLLECTION ====================
  {
    id: 26,
    number: "S1",
    name: "Golden Crest (Grb Saveza)",
    role: "Special Emblem",
    club: "Bosnia & Herzegovina FA",
    birthDate: "Est. 1992",
    height: "N/A",
    biography: "Holographic Emblem of the Football Association of Bosnia and Herzegovina. Adorned with the national colors of gold and blue, and stars depicting the night sky. The symbol of hope, unity, and deep-seated football patriotism for millions under the banner of the Zmajevi.",
    gameRatingRef: "Holographic Rarity ★★★★★",
    type: StickerType.SPECIAL,
    imageTheme: "from-amber-400 via-yellow-600 to-blue-900 animate-pulse bg-[length:200%_200%]",
    imageFile: "GoldenCrest.webp"
  },
  {
    id: 27,
    number: "S2",
    name: "Stadion \"Bilino Polje\" Zenica",
    role: "Special Venue",
    club: "Zenica Fortress",
    birthDate: "Built 1972",
    height: "Capacity: 15,600",
    biography: "The historical fortress and spiritual home of the Bosnian National Team in Zenica. Renowned for its incredibly intense atmosphere, where fans sit extremely close to the pitch, creating an intimidating wall of sound that has humbled many major world powerhouses.",
    gameRatingRef: "Legendary Venue Card ★★★★",
    type: StickerType.SPECIAL,
    imageTheme: "from-green-500 via-emerald-800 to-blue-950",
    imageFile: "stadionzenica.webp"
  },
  {
    id: 28,
    number: "S3",
    name: "Generacija 2014 (Brazil)",
    role: "Special Milestone",
    club: "Legendary Squad",
    birthDate: "World Cup 2014",
    height: "11 Pioneers",
    biography: "The historic generation of 2014 that qualified for Bosnia's first-ever FIFA World Cup in Brazil. Led by manager Safet Sušić, and stars like Spahić, Misimović, Ibišević, Lulić, and Džeko, they qualified for the tourney and captured the world's attention with beautiful, courageous attacking football.",
    gameRatingRef: "Golden Squad Card ★★★★★",
    type: StickerType.SPECIAL,
    imageTheme: "from-yellow-400 via-blue-600 to-indigo-950",
    imageFile: "2014.webp"
  },
  {
    id: 29,
    number: "S4",
    name: "BHFanaticos Support",
    role: "The 12th Man",
    club: "Tribina Sjever",
    birthDate: "Est. 2000",
    height: "Loud & Proud",
    biography: "The ultra fan group of Bosnia and Herzegovina national teams. Traveling across the globe from Europe to South America, they paint stadiums in blue and yellow. Armed with flares, drums, and chants, they are the loyal pulse pushing the team forward at all costs.",
    gameRatingRef: "Acoustic Firepower Card ★★★★",
    type: StickerType.SPECIAL,
    imageTheme: "from-red-600 via-blue-800 to-zinc-900",
    imageFile: "bhfanaticos.webp"
  }
];
