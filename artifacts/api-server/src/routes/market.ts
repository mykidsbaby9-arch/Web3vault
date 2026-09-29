import { Router } from "express";

const router = Router();

// Simulated live market data for top cryptocurrencies
const TOKENS = [
  { symbol: "BTC", name: "Bitcoin", price: 67842.31, change24h: 1243.5, changePercent24h: 1.87, volume24h: 31_200_000_000, marketCap: 1_334_000_000_000, logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", rank: 1 },
  { symbol: "ETH", name: "Ethereum", price: 3521.88, change24h: -45.2, changePercent24h: -1.27, volume24h: 18_500_000_000, marketCap: 423_000_000_000, logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png", rank: 2 },
  { symbol: "BNB", name: "BNB", price: 621.45, change24h: 12.3, changePercent24h: 2.02, volume24h: 2_100_000_000, marketCap: 90_000_000_000, logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png", rank: 3 },
  { symbol: "SOL", name: "Solana", price: 185.72, change24h: 8.91, changePercent24h: 5.04, volume24h: 4_800_000_000, marketCap: 85_000_000_000, logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png", rank: 4 },
  { symbol: "MATIC", name: "Polygon", price: 0.8823, change24h: -0.034, changePercent24h: -3.71, volume24h: 580_000_000, marketCap: 8_200_000_000, logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png", rank: 5 },
  { symbol: "AVAX", name: "Avalanche", price: 41.23, change24h: 1.8, changePercent24h: 4.56, volume24h: 890_000_000, marketCap: 17_000_000_000, logoUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.png", rank: 6 },
  { symbol: "ARB", name: "Arbitrum", price: 1.24, change24h: 0.07, changePercent24h: 5.98, volume24h: 410_000_000, marketCap: 4_900_000_000, logoUrl: "https://cryptologos.cc/logos/arbitrum-arb-logo.png", rank: 7 },
  { symbol: "OP", name: "Optimism", price: 2.87, change24h: 0.14, changePercent24h: 5.12, volume24h: 290_000_000, marketCap: 3_500_000_000, logoUrl: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png", rank: 8 },
  { symbol: "LINK", name: "Chainlink", price: 18.94, change24h: 0.62, changePercent24h: 3.39, volume24h: 890_000_000, marketCap: 11_000_000_000, logoUrl: "https://cryptologos.cc/logos/chainlink-link-logo.png", rank: 9 },
  { symbol: "UNI", name: "Uniswap", price: 11.23, change24h: -0.41, changePercent24h: -3.52, volume24h: 210_000_000, marketCap: 6_700_000_000, logoUrl: "https://cryptologos.cc/logos/uniswap-uni-logo.png", rank: 10 },
  { symbol: "AAVE", name: "Aave", price: 198.45, change24h: 7.23, changePercent24h: 3.78, volume24h: 320_000_000, marketCap: 2_900_000_000, logoUrl: "https://cryptologos.cc/logos/aave-aave-logo.png", rank: 11 },
  { symbol: "DOT", name: "Polkadot", price: 9.12, change24h: -0.28, changePercent24h: -2.98, volume24h: 430_000_000, marketCap: 12_000_000_000, logoUrl: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png", rank: 12 },
  { symbol: "ATOM", name: "Cosmos", price: 10.45, change24h: 0.55, changePercent24h: 5.56, volume24h: 280_000_000, marketCap: 4_100_000_000, logoUrl: "https://cryptologos.cc/logos/cosmos-atom-logo.png", rank: 13 },
  { symbol: "LTC", name: "Litecoin", price: 91.23, change24h: -1.2, changePercent24h: -1.3, volume24h: 650_000_000, marketCap: 6_800_000_000, logoUrl: "https://cryptologos.cc/logos/litecoin-ltc-logo.png", rank: 14 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.1821, change24h: 0.012, changePercent24h: 7.05, volume24h: 1_800_000_000, marketCap: 26_000_000_000, logoUrl: "https://cryptologos.cc/logos/dogecoin-doge-logo.png", rank: 15 },
];

// Add slight random variation to simulate live prices
function livePrice(token: typeof TOKENS[0]) {
  const variation = (Math.random() - 0.5) * 0.002;
  return { ...token, price: +(token.price * (1 + variation)).toFixed(8) };
}

router.get("/tickers", (req, res) => {
  res.json(TOKENS.map(livePrice));
});

router.get("/trending", (req, res) => {
  const trending = [...TOKENS].sort(() => Math.random() - 0.5).slice(0, 8).map(livePrice);
  res.json(trending);
});

router.get("/gainers", (req, res) => {
  const gainers = [...TOKENS].filter(t => t.changePercent24h > 0).sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 8).map(livePrice);
  res.json(gainers);
});

router.get("/losers", (req, res) => {
  const losers = [...TOKENS].filter(t => t.changePercent24h < 0).sort((a, b) => a.changePercent24h - b.changePercent24h).slice(0, 8).map(livePrice);
  res.json(losers);
});

router.get("/chart", (req, res) => {
  const symbol = (req.query.symbol as string) || "BTC";
  const period = (req.query.period as string) || "24h";
  const token = TOKENS.find(t => t.symbol === symbol) || TOKENS[0];

  const periodMap: Record<string, { points: number; interval: number }> = {
    "1h": { points: 60, interval: 60_000 },
    "24h": { points: 96, interval: 15 * 60_000 },
    "7d": { points: 168, interval: 60 * 60_000 },
    "30d": { points: 120, interval: 6 * 60 * 60_000 },
    "90d": { points: 90, interval: 24 * 60 * 60_000 },
    "1y": { points: 365, interval: 24 * 60 * 60_000 },
  };

  const { points, interval } = periodMap[period] || periodMap["24h"];
  const now = Date.now();
  const basePrice = token.price;
  let price = basePrice * 0.85;

  const candles = [];
  for (let i = points; i >= 0; i--) {
    const timestamp = Math.floor((now - i * interval) / 1000);
    const change = (Math.random() - 0.48) * 0.02;
    price = price * (1 + change);
    const open = price;
    const high = open * (1 + Math.random() * 0.015);
    const low = open * (1 - Math.random() * 0.015);
    const close = low + Math.random() * (high - low);
    const volume = basePrice * 1000 * (0.5 + Math.random());
    candles.push({ timestamp, open: +open.toFixed(4), high: +high.toFixed(4), low: +low.toFixed(4), close: +close.toFixed(4), volume: +volume.toFixed(2) });
  }

  res.json(candles);
});

export default router;
