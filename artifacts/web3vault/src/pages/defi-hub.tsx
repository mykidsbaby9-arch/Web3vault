import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Layers, TrendingUp, Droplets, ArrowRight, ExternalLink, Shield, Zap, Globe, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "wouter"

const PROTOCOLS = [
  { name: "Uniswap V3", category: "DEX", tvl: "4.2B", apy: null, logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png", network: "Ethereum", audited: true, desc: "The leading decentralized exchange. Provide liquidity and earn trading fees.", href: "#", tag: "DEX" },
  { name: "Aave V3", category: "Lending", tvl: "6.1B", apy: "3.8%", logo: "https://cryptologos.cc/logos/aave-aave-logo.png", network: "Multi-chain", audited: true, desc: "Supply assets to earn interest or borrow against your crypto collateral.", href: "#", tag: "Lending" },
  { name: "Curve Finance", category: "DEX", tvl: "2.9B", apy: "8.2%", logo: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png", network: "Ethereum", audited: true, desc: "Optimized stablecoin and pegged asset swaps with minimal slippage.", href: "#", tag: "DEX" },
  { name: "Compound V3", category: "Lending", tvl: "1.8B", apy: "4.5%", logo: "https://cryptologos.cc/logos/compound-comp-logo.png", network: "Ethereum", audited: true, desc: "Algorithmic interest rate markets for borrowing and lending digital assets.", href: "#", tag: "Lending" },
  { name: "GMX Perpetuals", category: "Derivatives", tvl: "890M", apy: "15%", logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png", network: "Arbitrum", audited: true, desc: "Decentralized perpetual contracts with up to 50x leverage. Zero price impact.", href: "#", tag: "Perps" },
  { name: "Lido Finance", category: "Staking", tvl: "28.4B", apy: "4.2%", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", network: "Ethereum", audited: true, desc: "Liquid staking for ETH. Earn rewards while keeping your assets liquid.", href: "#", tag: "Staking" },
  { name: "dYdX v4", category: "Derivatives", tvl: "420M", apy: "12%", logo: "https://cryptologos.cc/logos/dydx-dydx-logo.png", network: "Cosmos", audited: true, desc: "Advanced perpetual trading with order books, zero gas fees, and deep liquidity.", href: "#", tag: "Perps" },
  { name: "Yearn Finance", category: "Yield", tvl: "580M", apy: "11.4%", logo: "https://cryptologos.cc/logos/yearn-finance-yfi-logo.png", network: "Ethereum", audited: true, desc: "Automated yield aggregation. Deploy capital and let Yearn maximize your returns.", href: "#", tag: "Yield" },
  { name: "Balancer V2", category: "DEX", tvl: "1.1B", apy: "6.8%", logo: "https://cryptologos.cc/logos/balancer-bal-logo.png", network: "Multi-chain", audited: true, desc: "Programmable liquidity. Provide weighted pools and collect swap fees automatically.", href: "#", tag: "DEX" },
]

const CATEGORIES = ["All", "DEX", "Lending", "Perps", "Staking", "Yield"]

const OPPORTUNITIES = [
  { label: "ETH-USDC LP on Uniswap", yield: "24.3% APR", risk: "Medium", tvl: "$2.1B", icon: Droplets },
  { label: "stETH Liquid Staking", yield: "4.2% APY", risk: "Low", tvl: "$28B", icon: Shield },
  { label: "USDC Lending on Aave", yield: "6.8% APY", risk: "Low", tvl: "$4.1B", icon: DollarSign },
  { label: "GMX GLP Pool", yield: "18.4% APR", risk: "High", tvl: "$560M", icon: TrendingUp },
]

export default function DeFiHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-secondary" /> DeFi Hub
        </h1>
        <p className="text-white/60 mt-1">Discover and access the best DeFi protocols, sorted by yield and security rating.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total DeFi TVL", value: "$46.4B", icon: Globe, color: "text-cyan-400" },
          { label: "Protocols Listed", value: "9+", icon: Layers, color: "text-primary" },
          { label: "Avg. Yield", value: "8.1% APY", icon: TrendingUp, color: "text-green-400" },
          { label: "Chains Covered", value: "7", icon: Zap, color: "text-yellow-400" },
        ].map((s, i) => (
          <Card key={i} className="glass-panel">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}><s.icon className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-white/40">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Opportunities */}
      <Card className="glass-panel border-secondary/20 bg-secondary/5">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-secondary" /> Top Yield Opportunities Right Now</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OPPORTUNITIES.map((o, i) => (
              <div key={i} className="p-4 bg-black/30 rounded-xl border border-white/5 hover:border-secondary/30 transition-colors cursor-pointer group">
                <div className={`p-2.5 rounded-lg bg-secondary/10 text-secondary w-fit mb-3 group-hover:scale-110 transition-transform`}><o.icon className="w-5 h-5" /></div>
                <p className="text-sm font-semibold mb-1">{o.label}</p>
                <p className="text-xl font-bold text-green-400 font-mono">{o.yield}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                  <span>Risk: <span className={o.risk === 'Low' ? 'text-green-400' : o.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>{o.risk}</span></span>
                  <span>TVL {o.tvl}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Directory */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold">Protocol Directory</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all">
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROTOCOLS.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-panel p-5 rounded-2xl border-white/5 hover:border-white/15 transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={p.logo} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1" />
                  <div>
                    <h3 className="font-bold">{p.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-black/40 border-white/10">{p.network}</Badge>
                      {p.audited && <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-400 border-green-500/30"><Shield className="w-2.5 h-2.5 mr-0.5 inline" />Audited</Badge>}
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{p.tag}</Badge>
              </div>
              <p className="text-sm text-white/50 flex-1 mb-4">{p.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex gap-4 text-sm">
                  <div><p className="text-xs text-white/40">TVL</p><p className="font-mono font-bold">${p.tvl}</p></div>
                  {p.apy && <div><p className="text-xs text-white/40">APY</p><p className="font-bold text-green-400">{p.apy}</p></div>}
                </div>
                <WalletGateButton size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 gap-1.5 text-xs group-hover:border-primary/40 group-hover:text-primary transition-all" action="access this protocol">
                  Open <ExternalLink className="w-3 h-3" />
                </WalletGateButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
