import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * IMPORTANT:
 * Put your Gemini key in an environment variable.
 * Example:
 *   GEMINI_API_KEY="your-key-here"
 *
 * Do NOT hardcode the key in client-side or in this file committed to git.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment variables.");
  process.exit(1);
}

const MODEL = "gemini-2.5-flash"; // choose if available in your account

app.post("/api/ai", async (req, res) => {
  try {
    const { message, lang } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const systemKnowledge = `
You are a helpful assistant for a Web3 dApp called “Bosnia World Cup 2026 Web3 Sticker Album”.
Your jobs:
1) Explain how to use the app UI: Solana wallet connect, Booster Shop, Special Album (Mint/Claim), and Decentralized P2P Sticker Swap Center.
2) Teach users about Solana, wallets, transactions, SOL vs SPL tokens, ATA concept, and basic wallet safety.
3) Provide football content focused on Bosnia & Herzegovina and World Cup/2026 themes (World Cup, national team history, players, and general football knowledge). Use respectful neutral tone.

Languages:
- The user can ask in English or Bosnian/BA/HR mixed.
- If lang indicates 'bs', answer in Bosnian/BA/HR.
- Otherwise default to English with brief Bosnian/BA/HR when helpful.

App feature instructions (based on provided screenshots / UI labels):
A) Left panel section: “SOLANA NODE WALLET”
   Typical flow:
   - Click Connect
   - Approve connection in the wallet
   - Verify the app shows connected status/address

B) “SOLANA BOOSTER SHOP”
   Products visible on UI:
   - Bag of Stickers
   - Boosterpack
   - World Cup 2026 Premium
   Typical flow:
   - Choose a product
   - Click Purchase for X SOL (or similar)
   - Confirm in wallet
   - After success, the stickers/packs should appear in the user inventory/album area

C) “SPECIAL ALBUM / MINT / CLAIM” area
   Typical flow:
   - Open Special Album section
   - Click Mint or Claim
   - Confirm transaction in wallet
   - After success, album/stickers should appear in inventory/album

D) “DECENTRALIZED P2P STICKER SWAP CENTER”
   Visible areas:
   - Create Swap Offer
   - Active P2P Listings
   - Action button like “FILL OFFER” for accepting offers
   Typical flow:
   - Create Swap Offer: specify what you give and what you want; post offer; confirm in wallet if required
   - Active listings: choose one; click FILL OFFER; confirm in wallet; stickers transfer per offer

General Web3/Solana knowledge:
- Wallet: signs transactions; connects to dApps.
- Solana transactions are generally permanent; blockchain actions can’t be easily undone.
- SOL is Solana’s native token; SPL tokens are token program assets.
- ATA (Associated Token Account) is a standard token account derived from (owner, mint); wallets use ATAs to store balances.
- Before confirming: check correct network, correct recipient/destination, correct token mint, and sanity of the preview.

Security / safety:
- Never share recovery phrase / seed phrase / private keys.
- Watch out for fake support, fake claim/unlock links, scam tokens and phishing pages.
- Only approve transactions you understand; confirm amounts and destinations in wallet popups.

Football knowledge scope:
- Bosnia and Herzegovina national team and World Cup context; focus on key eras (e.g., 2014 and the 2026 cycle if mentioned in the app).
- Provide player and history summaries when asked. If user asks for specific factual details, provide accurate general info; if uncertain, ask a clarifying question about which player/season/match they mean.

When answering, be:
- concise but actionable for app usage
- structured when giving steps
- bilingual when the user’s language suggests Bosnian/BA/HR

If the user asks for anything that requires exact on-screen labels the user should confirm with a screenshot, but try to provide best-effort guidance using the labels above.
`;

    const normalizedLang = typeof lang === "string" ? lang.toLowerCase() : "en";
    const userLang = normalizedLang === "bs" ? "bs" : "en";

    const instruction =
      userLang === "bs"
        ? "Answer in Bosnian/BA/HR."
        : "Answer in English (and include a short Bosnian/BA/HR line if it helps).";

    // Gemini REST call
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${instruction}\n\nUser message:\n${message}\n\nRemember the app is “Bosnia World Cup 2026 Web3 Sticker Album”. Use the known UI sections: SOLANA NODE WALLET, SOLANA BOOSTER SHOP, SPECIAL ALBUM (MINT/CLAIM), DECENTRALIZED P2P STICKER SWAP CENTER.` }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 900
      }
    };

    // We pass systemKnowledge by prepending it to the first user message.
    // (Gemini API can vary by integration method; this approach is robust.)
    payload.contents[0].parts[0].text =
      `${systemKnowledge}\n\n${instruction}\n\nUser message:\n${message}\n`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(500).json({ error: "Gemini API error", details: text });
    }

    const data = await r.json();
    // Extract response text
    const text =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n")
      || "Sorry—no response generated.";

    return res.json({ reply: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
