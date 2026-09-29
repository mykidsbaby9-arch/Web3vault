import { Router } from "express";

const router = Router();

const HOLDINGS = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.4821, price: 67842.31, logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", network: "ethereum", contractAddress: null, costBasis: 52000 },
  { symbol: "ETH", name: "Ethereum", balance: 3.21, price: 3521.88, logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png", network: "ethereum", contractAddress: null, costBasis: 2800 },
  { symbol: "BNB", name: "BNB", balance: 12.5, price: 621.45, logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png", network: "bsc", contractAddress: null, costBasis: 500 },
  { symbol: "SOL", name: "Solana", balance: 45.0, price: 185.72, logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png", network: "solana", contractAddress: null, costBasis: 120 },
  { symbol: "MATIC", name: "Polygon", balance: 2800, price: 0.8823, logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.png", network: "polygon", contractAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", costBasis: 1.2 },
  { symbol: "AVAX", name: "Avalanche", balance: 80, price: 41.23, logoUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.png", network: "avalanche", contractAddress: null, costBasis: 32 },
];

router.get("/summary", (req, res) => {
  let totalValue = 0;
  let totalCost = 0;

  HOLDINGS.forEach(h => {
    totalValue += h.balance * h.price;
    totalCost += h.balance * h.costBasis;
  });

  const pnl = totalValue - totalCost;
  const pnlPercent = (pnl / totalCost) * 100;
  const dayChange = totalValue * 0.0187;
  const dayChangePercent = 1.87;

  const networkBreakdown = [
    { network: "Ethereum", value: HOLDINGS.filter(h => h.network === "ethereum").reduce((s, h) => s + h.balance * h.price, 0), percentage: 0, color: "#627EEA" },
    { network: "BSC", value: HOLDINGS.filter(h => h.network === "bsc").reduce((s, h) => s + h.balance * h.price, 0), percentage: 0, color: "#F3BA2F" },
    { network: "Polygon", value: HOLDINGS.filter(h => h.network === "polygon").reduce((s, h) => s + h.balance * h.price, 0), percentage: 0, color: "#8247E5" },
    { network: "Avalanche", value: HOLDINGS.filter(h => h.network === "avalanche").reduce((s, h) => s + h.balance * h.price, 0), percentage: 0, color: "#E84142" },
    { network: "Solana", value: HOLDINGS.filter(h => h.network === "solana").reduce((s, h) => s + h.balance * h.price, 0), percentage: 0, color: "#9945FF" },
  ].map(n => ({ ...n, percentage: +(n.value / totalValue * 100).toFixed(2) }));

  res.json({ totalValue: +totalValue.toFixed(2), totalCost: +totalCost.toFixed(2), pnl: +pnl.toFixed(2), pnlPercent: +pnlPercent.toFixed(2), dayChange: +dayChange.toFixed(2), dayChangePercent, networkBreakdown });
});

router.get("/holdings", (req, res) => {
  let totalValue = HOLDINGS.reduce((s, h) => s + h.balance * h.price, 0);
  const holdings = HOLDINGS.map(h => {
    const value = h.balance * h.price;
    const cost = h.balance * h.costBasis;
    const pnl = value - cost;
    const pnlPercent = (pnl / cost) * 100;
    return { symbol: h.symbol, name: h.name, balance: h.balance, price: h.price, value: +value.toFixed(2), cost: +cost.toFixed(2), pnl: +pnl.toFixed(2), pnlPercent: +pnlPercent.toFixed(2), allocation: +(value / totalValue * 100).toFixed(2), network: h.network, logoUrl: h.logoUrl, contractAddress: h.contractAddress };
  });
  res.json(holdings);
});

router.get("/history", (req, res) => {
  const period = (req.query.period as string) || "30d";
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  const days = daysMap[period] || 30;
  const now = Date.now();
  const baseValue = 31_000;
  let value = baseValue * 0.7;
  const history = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    value = value * (1 + (Math.random() - 0.46) * 0.03);
    history.push({ date, value: +value.toFixed(2) });
  }
  res.json(history);
});

export default router;
