import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createCollection } from '@metaplex-foundation/mpl-core';
import { keypairIdentity, generateSigner } from '@metaplex-foundation/umi';
import { readFileSync } from 'fs';

async function main() {
  const umi = createUmi('https://api.devnet.solana.com');
  
  // Load the admin keypair
  const secretKey = new Uint8Array(JSON.parse(readFileSync('./devnet-keypair.json', 'utf8')));
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  umi.use(keypairIdentity(keypair));

  console.log("Setting up Core Collection with authority:", keypair.publicKey.toString());

  // Generate a new signer to represent the collection address
  const collection = generateSigner(umi);

  console.log("Creating collection... this might take a few seconds.");
  
  await createCollection(umi, {
    collection: collection,
    name: 'Bosnia Zmajevi WC26',
    uri: 'https://example.com/collection.json', // In production, replace with Arweave/IPFS URI
  }).sendAndConfirm(umi);

  console.log("✅ Collection Created Successfully!");
  console.log("⭐ Collection Address:", collection.publicKey.toString());
  console.log("👉 Save this Collection Address for the minting script!");
}

main().catch(console.error);
