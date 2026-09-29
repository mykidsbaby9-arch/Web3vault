import { Router } from "express";
import { db } from "@workspace/db";
import { nftsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();
const DEFAULT_USER_ID = 1;

router.get("/", async (req, res) => {
  const nfts = await db.select().from(nftsTable).where(eq(nftsTable.userId, DEFAULT_USER_ID)).orderBy(desc(nftsTable.acquiredAt));
  res.json(nfts.map(n => ({ id: n.id, name: n.name, collection: n.collection, imageUrl: n.imageUrl, network: n.network, tokenId: n.tokenId, contractAddress: n.contractAddress, floorPrice: Number(n.floorPrice), lastSalePrice: n.lastSalePrice ? Number(n.lastSalePrice) : null, rarity: n.rarity, traits: n.traits || [] })));
});

router.get("/collections", async (req, res) => {
  const nfts = await db.select().from(nftsTable).where(eq(nftsTable.userId, DEFAULT_USER_ID));
  const collectionMap = new Map<string, { name: string; count: number; totalValue: number; floorPrice: number; imageUrl: string; network: string }>();

  for (const nft of nfts) {
    const existing = collectionMap.get(nft.collection);
    const value = Number(nft.floorPrice);
    if (existing) {
      existing.count++;
      existing.totalValue += value;
      if (value < existing.floorPrice) existing.floorPrice = value;
    } else {
      collectionMap.set(nft.collection, { name: nft.collection, count: 1, totalValue: value, floorPrice: value, imageUrl: nft.imageUrl, network: nft.network });
    }
  }

  const collections = Array.from(collectionMap.entries()).map(([slug, c]) => ({ ...c, slug, volume24h: c.totalValue * 0.05 }));
  res.json(collections);
});

router.get("/:id", async (req, res) => {
  const [nft] = await db.select().from(nftsTable).where(eq(nftsTable.id, Number(req.params.id)));
  if (!nft) return res.status(404).json({ error: "NFT not found" });
  res.json({ id: nft.id, name: nft.name, collection: nft.collection, imageUrl: nft.imageUrl, network: nft.network, tokenId: nft.tokenId, contractAddress: nft.contractAddress, floorPrice: Number(nft.floorPrice), lastSalePrice: nft.lastSalePrice ? Number(nft.lastSalePrice) : null, rarity: nft.rarity, traits: nft.traits || [] });
});

export default router;
