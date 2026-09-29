import { Router } from "express";
import { demoMinutesAgo } from "../lib/demo-time";

const router = Router();

const MOCK_APPROVALS = [
  { id: 1, token: "USDC", tokenSymbol: "USDC", spender: "0xE592427A0AEce92De3Edee1F18E0157C05861564", spenderName: "Uniswap V3 Router", allowance: "115792089237316195423570985008687907853269984665640564039457584007913129639935", isUnlimited: true, network: "ethereum", riskLevel: "safe" },
  { id: 2, token: "ETH", tokenSymbol: "WETH", spender: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF", spenderName: "0x Exchange Proxy", allowance: "115792089237316195423570985008687907853269984665640564039457584007913129639935", isUnlimited: true, network: "ethereum", riskLevel: "caution" },
  { id: 3, token: "MATIC", tokenSymbol: "MATIC", spender: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", spenderName: "QuickSwap Router", allowance: "10000000000000000000000", isUnlimited: false, network: "polygon", riskLevel: "safe" },
  { id: 4, token: "BNB", tokenSymbol: "BNB", spender: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8", spenderName: "Unknown Protocol", allowance: "115792089237316195423570985008687907853269984665640564039457584007913129639935", isUnlimited: true, network: "bsc", riskLevel: "danger" },
];

router.post("/scan", (req, res) => {
  const { address, network } = req.body;
  const riskScore = Math.floor(Math.random() * 40) + 10; // 10-50
  const riskLevel = riskScore < 25 ? "low" : riskScore < 50 ? "medium" : riskScore < 75 ? "high" : "critical";

  const threats = [];
  if (MOCK_APPROVALS.some(a => a.riskLevel === "danger")) {
    threats.push({ type: "suspicious_approval", severity: "high", description: "Unlimited token approval granted to unknown protocol", contractAddress: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8" });
  }
  if (MOCK_APPROVALS.some(a => a.isUnlimited)) {
    threats.push({ type: "unlimited_approval", severity: "medium", description: "Multiple unlimited token approvals detected — consider revoking unused ones", contractAddress: null });
  }

  const recommendations = [
    "Revoke unlimited approvals from unknown protocols",
    "Use time-limited approvals when possible",
    "Enable hardware wallet for large transactions",
    "Verify contract addresses before signing",
    "Consider using approval monitoring tools",
  ];

  res.json({ address, riskScore, riskLevel, threats, recommendations, scannedAt: new Date().toISOString() });
});

router.get("/approvals", (req, res) => {
  res.json(MOCK_APPROVALS.map(approval => ({ ...approval, approvedAt: demoMinutesAgo() })));
});

router.post("/revoke", (req, res) => {
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  res.json({ success: true, txHash });
});

export default router;
