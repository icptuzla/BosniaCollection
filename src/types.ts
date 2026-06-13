export interface PlayerStats {
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physicality: number;
}

export enum StickerType {
  STANDARD = "STANDARD",
  SPECIAL = "SPECIAL",
}

export interface Sticker {
  id: number;
  number: string;
  name: string;
  role: string; // ST, CM, CB, GK, or special classification
  roleBS?: string;
  club: string;
  birthDate: string;
  height: string;
  biography: string;
  biographyBS?: string;
  stats?: PlayerStats; // Null for special collections
  gameRatingRef: string; // E.g., "FC24 Overall: 84"
  type: StickerType;
  imageTheme: string; // Color scheme gradient classes (foil look, golden, sky)
  imageFile?: string; // Opt-in filename in components/players/
}

export interface UserSticker {
  stickerId: number;
  count: number;
  pasted: boolean;
}

export interface TradeOffer {
  id: string;
  ownerAddress: string;
  ownerName: string;
  offeredStickerId: number;
  requestedStickerId: number;
  solPrice?: number; // Optional Solana price if they want to sell for SOL
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  createdAt: number;
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number; // SOL balance
}
