import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { STICKERS } from "../src/data/players";
import { StickerType } from "../src/types";

const PRIMARY_IPFS_CID = "bafybeigu6pd4t72n7dskbn5wpk5pphf2566xixx5fugw3xhc3cyt44tumy";
const PRIMARY_IPFS_BASE = `https://black-known-amphibian-995.mypinata.cloud/ipfs/${PRIMARY_IPFS_CID}/components`;
const DEDIC_IPFS_URL = "https://QmXnbHGb7EuvQ4SupEp6ncU6WHLtfnNZquDTnyhGmoDQyn.ipfs.dweb.link";

const SPECIAL_COLLECTION_FILES = new Set([
  "GoldenCrest.webp",
  "RewardGoldenCrest.webp",
  "stadionzenica.webp",
  "Bosnia2014.webp",
  "bhfanaticos.webp",
]);

function getImageFile(imageFile?: string): { uri: string; type: string } {
  if (!imageFile) return { uri: "", type: "image/png" };
  if (imageFile === "dedic.webp") return { uri: DEDIC_IPFS_URL, type: "image/webp" };

  const fileName = imageFile === "GoldenCrest.webp" ? "GoldenCrest.png" : imageFile;
  const folder = SPECIAL_COLLECTION_FILES.has(fileName) ? "special_collection" : "players";
  return {
    uri: `${PRIMARY_IPFS_BASE}/${folder}/${fileName}`,
    type: fileName.endsWith(".png") ? "image/png" : "image/webp",
  };
}

const outputDir = join(process.cwd(), "public", "metadata");
mkdirSync(outputDir, { recursive: true });

for (const sticker of STICKERS) {
  const image = getImageFile(sticker.imageFile);
  const attributes = [
    { trait_type: "Sticker Number", value: sticker.number },
    { trait_type: "Role", value: sticker.role },
    { trait_type: "Club", value: sticker.club },
    { trait_type: "Type", value: sticker.type },
    { trait_type: "Rating Reference", value: sticker.gameRatingRef },
  ];

  if (sticker.stats) {
    attributes.push(
      { trait_type: "Overall", value: String(sticker.stats.overall) },
      { trait_type: "Pace", value: String(sticker.stats.pace) },
      { trait_type: "Shooting", value: String(sticker.stats.shooting) },
      { trait_type: "Passing", value: String(sticker.stats.passing) },
      { trait_type: "Dribbling", value: String(sticker.stats.dribbling) },
      { trait_type: "Defending", value: String(sticker.stats.defending) },
      { trait_type: "Physicality", value: String(sticker.stats.physicality) },
    );
  }

  const metadata = {
    name: `BiH WC26 - ${sticker.name}`,
    symbol: "BIHWC26",
    description: sticker.biography,
    image: image.uri,
    attributes,
    properties: {
      category: "image",
      files: [
        {
          uri: image.uri,
          type: image.type,
        },
      ],
    },
    collection: {
      name: "Bosnia Zmajevi WC26",
      family: sticker.type === StickerType.SPECIAL ? "Special Collection" : "Player Stickers",
    },
  };

  writeFileSync(
    join(outputDir, `${sticker.id}.json`),
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );
}

console.log(`Generated ${STICKERS.length} NFT metadata files in ${outputDir}`);
