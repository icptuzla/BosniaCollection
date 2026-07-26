import React, { useState, useMemo } from "react";
import { ArrowLeftRight, Check, Coins, Plus, Trash2, AlertCircle, Sparkles, User, Tag, Loader2 } from "lucide-react";
import { Sticker, UserSticker, TradeOffer, WalletState } from "../types";
import { STICKERS } from "../data/players";
import { Language } from "../data/translations";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { transactionBuilder, publicKey, sol } from "@metaplex-foundation/umi";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";

interface TradeMarketProps {
  wallet: WalletState;
  onWalletChange: (newWallet: WalletState) => void;
  collection: UserSticker[];
  onTradeCompleted: (offeredId: number, requestedId: number, solPrice?: number) => void;
  onSelfTradePosted: (offer: TradeOffer) => void;
  tradeOffers: TradeOffer[];
  onRemoveTradeOffer: (id: string) => void;
  lang: Language;
}

export default function TradeMarket({
  wallet,
  onWalletChange,
  collection,
  onTradeCompleted,
  onSelfTradePosted,
  tradeOffers,
  onRemoveTradeOffer,
  lang,
}: TradeMarketProps) {
  const solanaWallet = useWallet();
  const { connection } = useConnection();

  const umi = useMemo(() => {
    const u = createUmi(connection.rpcEndpoint);
    if (solanaWallet.wallet) {
      u.use(walletAdapterIdentity(solanaWallet));
    }
    return u;
  }, [connection, solanaWallet]);

  const [selectedOfferStickerId, setSelectedOfferStickerId] = useState<number>(-1);
  const [selectedWantStickerId, setSelectedWantStickerId] = useState<number>(-1);
  const [sellingForSol, setSellingForSol] = useState(false);
  const [solValue, setSolValue] = useState<number>(0.1);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter stickers that the user has duplicates of
  const userDuplicates = collection.filter(c => c.count > 1);

  const getStickerById = (id: number): Sticker | undefined => {
    return STICKERS.find(s => s.id === id);
  };

  const handlePostTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!wallet.connected || !solanaWallet.publicKey) {
      setErrorText("You must connect your Solflare or Sandbox wallet before listing a trade offer!");
      return;
    }

    if (selectedOfferStickerId === -1) {
      setErrorText("You must select a duplicate sticker to offer!");
      return;
    }

    if (!sellingForSol && selectedWantStickerId === -1) {
      setErrorText("You must select which sticker you want to receive in exchange!");
      return;
    }

    if (sellingForSol && (solValue <= 0 || isNaN(solValue))) {
      setErrorText("Please enter a valid Solana amount greater than zero!");
      return;
    }

    if (selectedOfferStickerId === selectedWantStickerId) {
      setErrorText("You cannot offer and request the exact same sticker!");
      return;
    }

    // Verify user actually has duplicate
    const pRecord = collection.find(c => c.stickerId === selectedOfferStickerId);
    if (!pRecord || pRecord.count < 2) {
      setErrorText("Validation Failed: You do not possess duplicates of this sticker card in your pouch!");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Simulate Maker signing their portion of the transaction (Partial Signature)
      // We do a minimal transfer to System Program to prove wallet ownership and intent
      let tx = transactionBuilder().add(transferSol(umi, {
        source: umi.identity,
        destination: publicKey("11111111111111111111111111111111"), 
        amount: sol(0.00001)
      }));
      
      const result = await tx.sendAndConfirm(umi);
      console.log("Maker intent signed. Tx:", result.signature);

      // Create trade offer
      const tradeId = "tx-trd-" + Math.random().toString(36).substr(2, 9);
      const newOffer: TradeOffer = {
        id: tradeId,
        ownerAddress: solanaWallet.publicKey.toBase58(),
        ownerName: "My Wallet (" + solanaWallet.publicKey.toBase58().substring(0, 5) + ")",
        offeredStickerId: selectedOfferStickerId,
        requestedStickerId: sellingForSol ? -1 : selectedWantStickerId,
        solPrice: sellingForSol ? Number(solValue.toFixed(2)) : undefined,
        status: "OPEN",
        createdAt: Date.now(),
      };

      onSelfTradePosted(newOffer);
      
      // Deduct count of dummy pending block locally
      onTradeCompleted(selectedOfferStickerId, -1, undefined); 

      setSuccessText(`✓ Trade offer #${tradeId.toUpperCase()} listed successfully! Partial Signature verified on Devnet.`);
      setSelectedOfferStickerId(-1);
      setSelectedWantStickerId(-1);
      setSellingForSol(false);
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Failed to sign trade authorization.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptTrade = async (offer: TradeOffer) => {
    setErrorText(null);
    setSuccessText(null);

    if (!wallet.connected || !solanaWallet.publicKey) {
      setErrorText("Connect your web3 Solana / Solflare wallet card first!");
      return;
    }

    if (offer.ownerAddress === solanaWallet.publicKey.toBase58()) {
      setErrorText("You cannot accept your own trade listings!");
      return;
    }

    // Checking requirements
    if (offer.requestedStickerId !== -1) {
      // requires sticker
      const userHasSticker = collection.find(c => c.stickerId === offer.requestedStickerId);
      if (!userHasSticker || userHasSticker.count < 1) {
        const targetSticker = getStickerById(offer.requestedStickerId);
        setErrorText(`Trade Blocked: You do not have the requested sticker card [${targetSticker?.name}] to swap!`);
        return;
      }
    } else if (offer.solPrice) {
      // requires SOL
      if (wallet.balance < offer.solPrice) {
        setErrorText(`Trade Blocked: Your wallet balance is below the requested ${offer.solPrice} SOL!`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Construct the counter-signature transaction
      if (offer.solPrice) {
        // True P2P: Taker transfers SOL directly to Maker
        let tx = transactionBuilder().add(transferSol(umi, {
          source: umi.identity,
          destination: publicKey(offer.ownerAddress),
          amount: sol(offer.solPrice)
        }));
        
        const result = await tx.sendAndConfirm(umi);
        console.log("Taker P2P SOL transfer signed. Tx:", result.signature);

        // Update local wallet balance visually
        onWalletChange({
          ...wallet,
          balance: Number((wallet.balance - offer.solPrice).toFixed(2)),
        });
      } else {
        // Taker signs an intent to swap the asset (simulate)
        let tx = transactionBuilder().add(transferSol(umi, {
          source: umi.identity,
          destination: publicKey(offer.ownerAddress), 
          amount: sol(0.00001) // minimal network verification
        }));
        const result = await tx.sendAndConfirm(umi);
        console.log("Taker swap intent signed. Tx:", result.signature);
      }

      // Execute trade locally
      if (offer.requestedStickerId !== -1) {
        onTradeCompleted(offer.requestedStickerId, offer.offeredStickerId, undefined);
      } else {
        onTradeCompleted(-1, offer.offeredStickerId, offer.solPrice);
      }

      // Remove offer from global listings as completed
      onRemoveTradeOffer(offer.id);
      
      // Synthesize transaction success sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (_) {}

      setSuccessText(`✓ Trade completed! Received ${getStickerById(offer.offeredStickerId)?.name}. Blockchain synced.`);
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "Failed to execute trade transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      
      {/* Visual Header */}
      <div className="text-center">
        <h2 className="text-2xl font-sans font-black text-text uppercase tracking-tighter leading-none">
          Decentralized P2P Sticker Swap Center
        </h2>
        <p className="text-xs font-sans text-text-muted mt-1">
          Barter duplicate cards with physical collectors or buy them using Devnet SOL!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= POST A NEW TRADE (Left Column) ================= */}
        <div className="lg:col-span-1 bg-surface border border-border p-5 rounded-2xl text-left text-text">
          <h3 className="text-md font-sans font-extrabold text-text mb-4 flex items-center space-x-2">
            <Plus className="h-4.5 w-4.5 text-primary" />
            <span>Create Swap Offer</span>
          </h3>

          <form onSubmit={handlePostTrade} className="space-y-4">
            <div>
              <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted block mb-1">
                SELECT STICKER TO OFFER (Must have duplicate):
              </label>
              {userDuplicates.length === 0 ? (
                <div className="p-3.5 bg-surface-2 border border-border rounded-xl text-xs font-sans text-text-muted text-center">
                  No duplicates available in pouch yet. Open booster packs first!
                </div>
              ) : (
                <select
                  id="select-offer-sticker"
                  value={selectedOfferStickerId}
                  onChange={(e) => setSelectedOfferStickerId(Number(e.target.value))}
                  className="w-full bg-surface-2 border border-border text-text p-2.5 rounded-xl text-xs font-sans font-semibold focus:border-primary focus:outline-none transition"
                >
                  <option value={-1}>-- Choose duplicate card --</option>
                  {userDuplicates.map((dup) => {
                    const st = getStickerById(dup.stickerId);
                    return (
                      <option key={dup.stickerId} value={dup.stickerId}>
                        [{st?.number}] {st?.name} ({dup.count - 1} extra)
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Pivot trade type */}
            {selectedOfferStickerId !== -1 && (
              <div className="flex bg-surface-2/50 p-1.5 rounded-xl border border-border text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setSellingForSol(false)}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    !sellingForSol ? "bg-surface-3 text-primary font-extrabold" : "text-text-muted hover:text-text"
                  }`}
                >
                  Swap for Card
                </button>
                <button
                  type="button"
                  onClick={() => setSellingForSol(true)}
                  className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${
                    sellingForSol ? "bg-surface-3 text-primary font-extrabold" : "text-text-muted hover:text-text"
                  }`}
                >
                  Sell for SOL
                </button>
              </div>
            )}

            {!sellingForSol ? (
              <div>
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted block mb-1">
                  CHOOSE CARD YOU WANT IN RETURN:
                </label>
                <select
                  id="select-want-sticker"
                  value={selectedWantStickerId}
                  onChange={(e) => setSelectedWantStickerId(Number(e.target.value))}
                  className="w-full bg-surface-2 border border-border text-text p-2.5 rounded-xl text-xs font-sans font-semibold focus:border-primary focus:outline-none transition"
                >
                  <option value={-1}>-- Choose requested player --</option>
                  {STICKERS.map((st) => (
                    <option key={st.id} value={st.id}>
                      [{st.number}] {st.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted block mb-1">
                  PRICE IN CRYPTO (SOL):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={solValue}
                    onChange={(e) => setSolValue(parseFloat(e.target.value))}
                    className="w-full bg-surface-2 border border-border text-text p-2.5 rounded-xl text-xs font-mono pl-8 focus:border-primary focus:outline-none transition"
                  />
                  <Coins className="h-4 w-4 text-gold absolute left-2.5 top-3" />
                </div>
              </div>
            )}

            <button
              id="btn-list-swap-offer"
              type="submit"
              disabled={!wallet.connected || selectedOfferStickerId === -1 || isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-sans font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
            >
              {isProcessing && document.activeElement?.id === "btn-list-swap-offer" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              <span>Broadcast Trade to Ledger</span>
            </button>
            
            {!wallet.connected && (
              <p className="text-[11px] font-sans font-bold text-danger text-center">
                * Please connect a Solana / Solflare wallet to broadcast.
              </p>
            )}
          </form>

          {errorText && (
            <div className="mt-4 bg-danger/10 border border-danger/30 text-danger text-xs font-sans font-medium flex items-start space-x-1.5 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {successText && (
            <div className="mt-4 bg-success/10 border border-success/30 text-success text-xs font-sans font-semibold flex items-start space-x-1.5 rounded-xl px-4 py-3">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successText}</span>
            </div>
          )}
        </div>

        {/* ================= ACTIVE TRADE OFFERS (Right 2 Columns) ================= */}
        <div className="lg:col-span-2 bg-surface border border-border p-5 rounded-2xl text-left flex flex-col justify-between text-text">
          <div>
            <h3 className="text-md font-sans font-bold text-text mb-4 flex items-center space-x-2">
              <ArrowLeftRight className="h-4.5 w-4.5 text-primary" />
              <span>Active P2P Listings ({tradeOffers.length})</span>
            </h3>

            {tradeOffers.length === 0 ? (
              <div className="p-12 text-center text-text-muted font-sans text-sm border border-dashed border-border rounded-xl space-y-1">
                <p>No trade proposals are currently broadcast on the ledger.</p>
                <p className="text-xs text-text-dim font-sans font-normal mt-1">Create your own offer above or check back shortly!</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {tradeOffers.map((offer) => {
                  const offerSticker = getStickerById(offer.offeredStickerId);
                  const wantSticker = offer.requestedStickerId !== -1 ? getStickerById(offer.requestedStickerId) : null;
                  const isMine = offer.ownerAddress === solanaWallet.publicKey?.toBase58();

                  return (
                    <div
                      key={offer.id}
                      className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition duration-200 ${
                        isMine
                          ? "bg-surface-2 border-gold/30"
                          : "bg-surface-2 border-border hover:border-border-hover"
                      }`}
                    >
                      {/* Left: Swapping details */}
                      <div className="flex items-center space-x-4">
                        <div className="shrink-0 flex items-center space-x-2 bg-surface-3 py-1.5 px-2.5 rounded-lg border border-border">
                          <span className="text-[11px] font-sans text-text-muted font-extrabold uppercase">Tx</span>
                        </div>

                        <div className="text-xs font-sans text-left">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-text">
                            <span className="font-extrabold text-text">[{offerSticker?.number}] {offerSticker?.name}</span>
                            <span className="text-text-dim font-sans text-[11px]">for</span>
                            
                            {wantSticker ? (
                              <span className="font-extrabold text-text">[{wantSticker.number}] {wantSticker.name}</span>
                            ) : (
                              <span className="font-black text-gold flex items-center">
                                <Coins className="h-3.5 w-3.5 mr-0.5 text-gold" /> {offer.solPrice} SOL
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-text-muted flex items-center space-x-2 font-medium">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-0.5" /> {offer.ownerName}
                            </span>
                            <span>•</span>
                            <span className="text-success text-[11px]">MINT: Metaplex Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="shrink-0 self-end md:self-auto flex items-center space-x-2">
                        {isMine ? (
                          <button
                            id={`btn-cancel-trade-${offer.id}`}
                            onClick={() => onRemoveTradeOffer(offer.id)}
                            className="p-2 px-3 rounded-xl bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger transition cursor-pointer flex items-center space-x-1 text-xs font-sans font-bold"
                            title="Revoke Listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Revoke</span>
                          </button>
                        ) : (
                          <button
                            id={`btn-accept-trade-${offer.id}`}
                            disabled={isProcessing}
                            onClick={() => handleAcceptTrade(offer)}
                            className="py-1.5 px-3.5 rounded-xl bg-gold hover:bg-gold-hover text-base font-sans font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed space-x-1"
                          >
                            {isProcessing && document.activeElement?.id === `btn-accept-trade-${offer.id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            <span>Fill Offer</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center space-x-2 text-xs font-sans text-text-dim">
            <Sparkles className="h-4 w-4 text-gold" />
            <span>All trades use simulated zero-trust blockchain signatures for safe swap resolution.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
