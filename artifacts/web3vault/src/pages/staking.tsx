import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Zap, TrendingUp, Lock, Unlock, Clock, Shield, ChevronDown, ArrowRight, Info } from "lucide-react"
import { motion } from "framer-motion"

const STAKING_POOLS = [
  { id: 1, name: "Ethereum Staking", token: "ETH", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", apy: 4.2, tvl: 28_400_000_000, minStake: 0.01, lockPeriod: "Flexible", risk: "Low", rewards: "stETH", myStaked: 1.5, myRewards: 0.063, network: "ethereum", color: "from-blue-500/20 to-purple-500/10", badge: "Popular" },
  { id: 2, name: "SOL Liquid Staking", token: "SOL", icon: "https://cryptologos.cc/logos/solana-sol-logo.png", apy: 7.8, tvl: 4_100_000_000, minStake: 0.1, lockPeriod: "Flexible", risk: "Low", rewards: "mSOL", myStaked: 20, myRewards: 1.56, network: "solana", color: "from-purple-500/20 to-cyan-500/10", badge: "High Yield" },
  { id: 3, name: "MATIC Staking", token: "MATIC", icon: "https://cryptologos.cc/logos/polygon-matic-logo.png", apy: 5.5, tvl: 1_800_000_000, minStake: 1, lockPeriod: "Flexible", risk: "Low", rewards: "MATIC", myStaked: 0, myRewards: 0, network: "polygon", color: "from-violet-500/20 to-pink-500/10", badge: null },
  { id: 4, name: "AVAX Staking", token: "AVAX", icon: "https://cryptologos.cc/logos/avalanche-avax-logo.png", apy: 9.1, tvl: 3_200_000_000, minStake: 25, lockPeriod: "14 days", risk: "Medium", rewards: "AVAX", myStaked: 0, myRewards: 0, network: "avalanche", color: "from-red-500/20 to-orange-500/10", badge: "Locked" },
  { id: 5, name: "ATOM Staking", token: "ATOM", icon: "https://cryptologos.cc/logos/cosmos-atom-logo.png", apy: 14.5, tvl: 2_900_000_000, minStake: 1, lockPeriod: "21 days", risk: "Medium", rewards: "ATOM", myStaked: 0, myRewards: 0, network: "cosmos", color: "from-indigo-500/20 to-blue-500/10", badge: "High APY" },
  { id: 6, name: "BNB Auto-Compound", token: "BNB", icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png", apy: 6.3, tvl: 5_800_000_000, minStake: 0.1, lockPeriod: "Flexible", risk: "Low", rewards: "BNB", myStaked: 5, myRewards: 0.315, network: "bsc", color: "from-yellow-500/20 to-orange-500/10", badge: null },
]

export default function Staking() {
  const [selectedPool, setSelectedPool] = useState<typeof STAKING_POOLS[0] | null>(null)
  const [amount, setAmount] = useState("")
  const [tab, setTab] = useState<"stake" | "unstake">("stake")

  const totalStakedUsd = STAKING_POOLS.reduce((s, p) => {
    const prices: Record<string, number> = { ETH: 3521, SOL: 185, MATIC: 0.88, AVAX: 41, ATOM: 10, BNB: 621 }
    return s + p.myStaked * (prices[p.token] || 1)
  }, 0)

  const totalDailyRewards = STAKING_POOLS.filter(p => p.myStaked > 0).reduce((s, p) => {
    return s + (p.myStaked * p.apy / 100 / 365)
  }, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-400" /> Staking Hub
        </h1>
        <p className="text-white/60 mt-1">Earn passive yield by staking your assets in audited protocols.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Staked Value", value: `$${totalStakedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Lock, color: "text-primary" },
          { label: "Daily Earnings", value: `~$${(totalDailyRewards * 200).toFixed(2)}`, icon: TrendingUp, color: "text-green-400" },
          { label: "Active Positions", value: `${STAKING_POOLS.filter(p => p.myStaked > 0).length}`, icon: Zap, color: "text-yellow-400" },
        ].map((s, i) => (
          <Card key={i} className="glass-panel">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-white/50">{s.label}</p>
                <p className="text-2xl font-bold font-mono">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pool List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold px-1">Available Pools</h2>
          {STAKING_POOLS.map((pool, i) => (
            <motion.button
              key={pool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedPool(pool)}
              className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedPool?.id === pool.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-black/20 hover:border-white/15 hover:bg-white/[0.02]'}`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${pool.color} opacity-30 pointer-events-none`} style={{ position: 'absolute' }} />
              <div className="flex items-center gap-4">
                <img src={pool.icon} alt={pool.token} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-lg">{pool.name}</span>
                    {pool.badge && (
                      <Badge className={`text-[10px] px-2 py-0.5 ${pool.badge === 'High APY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : pool.badge === 'Locked' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
                        {pool.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/50">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pool.lockPeriod}</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {pool.risk} risk</span>
                    <span>TVL ${(pool.tvl / 1e9).toFixed(1)}B</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{pool.apy}%</div>
                  <div className="text-xs text-white/40">APY</div>
                  {pool.myStaked > 0 && (
                    <div className="text-xs text-primary mt-1 font-mono">Staked: {pool.myStaked} {pool.token}</div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Stake Panel */}
        <div className="space-y-4">
          <Card className="glass-panel border-white/5 sticky top-4">
            {selectedPool ? (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <img src={selectedPool.icon} alt={selectedPool.token} className="w-8 h-8 rounded-full" />
                    {selectedPool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stake/Unstake tabs */}
                  <div className="flex bg-black/40 rounded-lg p-1">
                    <button onClick={() => setTab("stake")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "stake" ? "bg-primary text-white" : "text-white/50 hover:text-white"}`}>
                      <Lock className="w-3.5 h-3.5 inline mr-1.5" />Stake
                    </button>
                    <button onClick={() => setTab("unstake")} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "unstake" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}>
                      <Unlock className="w-3.5 h-3.5 inline mr-1.5" />Unstake
                    </button>
                  </div>

                  <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between mb-2 text-xs text-white/50">
                      <span>{tab === "stake" ? "Amount to Stake" : "Amount to Unstake"}</span>
                      <span>Balance: {tab === "stake" ? "3.21" : selectedPool.myStaked} {selectedPool.token}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                        className="bg-transparent border-none p-0 h-auto text-3xl font-mono placeholder:text-white/20 focus-visible:ring-0 text-white flex-1" />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setAmount("MAX")}>MAX</Button>
                        <span className="font-bold text-white/80">{selectedPool.token}</span>
                      </div>
                    </div>
                  </div>

                  {/* Projected earnings */}
                  {amount && Number(amount) > 0 && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-2">
                      <p className="text-xs text-green-400 font-medium">Projected Earnings</p>
                      <div className="flex justify-between text-sm"><span className="text-white/60">Daily</span><span className="font-mono text-green-400">+{(Number(amount) * selectedPool.apy / 100 / 365).toFixed(6)} {selectedPool.token}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-white/60">Monthly</span><span className="font-mono text-green-400">+{(Number(amount) * selectedPool.apy / 100 / 12).toFixed(4)} {selectedPool.token}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-white/60">Yearly</span><span className="font-mono text-green-400">+{(Number(amount) * selectedPool.apy / 100).toFixed(4)} {selectedPool.token}</span></div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-white/50">APY</span><span className="text-green-400 font-bold">{selectedPool.apy}%</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Rewards Token</span><span>{selectedPool.rewards}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Lock Period</span><span>{selectedPool.lockPeriod}</span></div>
                  </div>

                  <WalletGateButton className={`w-full h-12 font-bold text-white ${tab === "stake" ? "bg-primary hover:bg-primary/90" : "bg-white/10 hover:bg-white/20"}`} action={tab === "stake" ? `stake ${selectedPool.token}` : `unstake ${selectedPool.token}`}>
                    {tab === "stake" ? <><Lock className="w-4 h-4 mr-2" />Stake {selectedPool.token}</> : <><Unlock className="w-4 h-4 mr-2" />Unstake {selectedPool.token}</>}
                  </WalletGateButton>
                  <p className="text-xs text-white/30 text-center flex items-center justify-center gap-1"><Info className="w-3 h-3" /> {tab === "unstake" && selectedPool.lockPeriod !== "Flexible" ? `Unstaking takes ${selectedPool.lockPeriod}` : "No lock-up period. Withdraw anytime."}</p>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-white/80">Select a Pool</p>
                  <p className="text-sm text-white/40 mt-1">Choose a staking pool to see yield projections and start earning.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 rotate-180" />
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
