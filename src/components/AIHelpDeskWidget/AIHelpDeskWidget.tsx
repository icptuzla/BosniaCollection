import React, { useMemo, useState, useEffect, useRef } from "react";

type Lang = "en" | "bs";

type ChatRole = "user" | "bot";
type ChatMessage = { role: ChatRole; text: string };

const API_URL = "/api/ai"; // <-- your backend endpoint (DO NOT put Gemini key in frontend)
const HELP_LOGO_URL = "/AIHelpLogo.png";

function detectLangFromText(text: string): Lang | null {
  const bsHints = /č|ć|đ|ž|š/i.test(text);
  return bsHints ? "bs" : null;
}

type AIHelpDeskWidgetProps = {
  lang?: "BS" | "EN";
};

export default function AIHelpDeskWidget({ lang: appLang = "EN" }: AIHelpDeskWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  const styles = useMemo(
    () => `
    .ai-soccer-btn{
      position: fixed; right: 18px; bottom: 18px;
      width: 64px; height: 64px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,.75);
      cursor: pointer;
      background: #061c62;
      box-shadow: 0 12px 28px rgba(0,0,0,.32);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999;
      overflow: hidden;
      padding: 0;
    }
    .ai-soccer-btn:active{ transform: scale(.98); }
    .ai-soccer-btn img{
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    .ai-chat-modal{
      position: fixed; right: 18px; bottom: 78px;
      width: min(420px, calc(100vw - 36px));
      height: min(640px, calc(100vh - 110px));
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 18px 40px rgba(0,0,0,.28);
      z-index: 999999;
      display: none;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,.08);
    }
    .ai-chat-modal.open{ display: flex; flex-direction: column; }

    .ai-chat-header{
      padding: 12px 14px;
      background: #0b5ed7;
      color: #fff;
      display: flex; align-items: center; justify-content: space-between;
      font-weight: 700;
      gap: 10px;
    }
    .ai-chat-header .title{
      display: flex; align-items: center; gap: 10px;
      font-size: 14px;
    }
    .ai-header-logo{
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 0 0 1px rgba(255,255,255,.35);
    }
    .ai-close{
      background: transparent; border: 0; color: #fff;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 6px 8px;
      border-radius: 10px;
    }
    .ai-close:hover{ background: rgba(255,255,255,.12); }

    .ai-chat-body{
      padding: 12px 12px 0 12px;
      flex: 1;
      overflow: auto;
      background: linear-gradient(#f7fbff, #ffffff);
    }
    .ai-msg{
      margin: 8px 0;
      padding: 10px 12px;
      border-radius: 14px;
      max-width: 92%;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 13.5px;
      line-height: 1.35;
    }
    .ai-msg.user{
      margin-left: auto;
      background: #0b5ed7;
      color: #fff;
      border-top-right-radius: 6px;
    }
    .ai-msg.bot{
      margin-right: auto;
      background: #e9f2ff;
      color: #0b1b33;
      border-top-left-radius: 6px;
    }

    .ai-chat-footer{
      padding: 10px 10px 12px 10px;
      border-top: 1px solid rgba(0,0,0,.08);
      background: #fff;
    }
    .ai-input-row{
      display: flex; gap: 8px; align-items: flex-end;
    }
    .ai-textarea{
      flex: 1;
      resize: none;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,.12);
      padding: 10px 12px;
      font-size: 13.5px;
      outline: none;
      min-height: 44px;
      max-height: 120px;
    }
    .ai-send-btn{
      border: 0;
      border-radius: 12px;
      background: #0b5ed7;
      color: #fff;
      cursor: pointer;
      padding: 12px 14px;
      font-weight: 700;
      min-width: 86px;
    }
    .ai-send-btn:disabled{ opacity: .6; cursor: not-allowed; }

    .ai-hint{
      font-size: 11.5px; color: rgba(0,0,0,.55);
      margin-top: 8px;
    }
  `,
    []
  );

  useEffect(() => {
    // inject styles once
    const id = "ai-help-desk-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = styles;
    document.head.appendChild(el);
  }, [styles]);

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: "Hi! I can help you with the Bosnia World Cup 2026 Web3 Sticker Album, Solana wallets, NFTs/stickers, and the swap flows. What do you want to do?",
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, open, isLoading]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    setIsLoading(true);
    try {
      const lang: Lang = detectLangFromText(trimmed) || (appLang === "BS" ? "bs" : "en");

      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lang }),
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(text || `HTTP ${r.status}`);
      }

      const data = (await r.json()) as { reply?: string };
      const reply = data.reply ?? "No reply generated.";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (e: any) {
      console.error("AI Help Desk request failed", e);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry—could not contact the AI service right now." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className="ai-soccer-btn" type="button" aria-label="AI Help Desk" onClick={() => setOpen(true)}>
        <img src={HELP_LOGO_URL} alt="" aria-hidden="true" />
      </button>

      <div className={`ai-chat-modal ${open ? "open" : ""}`}>
        <div className="ai-chat-header">
          <div className="title">
            <img className="ai-header-logo" src={HELP_LOGO_URL} alt="" aria-hidden="true" />
            <span>AI Help Desk</span>
          </div>
          <button className="ai-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="ai-chat-body" ref={chatBodyRef}>
          {messages.map((m, idx) => (
            <div key={idx} className={`ai-msg ${m.role}`}>
              {m.text}
            </div>
          ))}
          {isLoading ? (
            <div className="ai-msg bot" style={{ opacity: 0.8 }}>
              Thinking…
            </div>
          ) : null}
        </div>

        <div className="ai-chat-footer">
          <div className="ai-input-row">
            <textarea
              className="ai-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Solana, wallets, NFT/stickers, or the Bosnia World Cup album..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button className="ai-send-btn" type="button" onClick={send} disabled={isLoading}>
              {isLoading ? "..." : "Send"}
            </button>
          </div>
          <div className="ai-hint">Tip: Ask “How do I connect my wallet?” or “How do I use Swap Center?”</div>
        </div>
      </div>
    </>
  );
}
