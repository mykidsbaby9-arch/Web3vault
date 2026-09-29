import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Coins, Clock, CheckCircle2, Timer, Loader2, Gift, Zap, Globe, Trophy, ArrowRight, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const FAUCETS = [
  { id: 1, network: "Ethereum Sepolia", token: "ETH", amount: "0.5", waitHours: 24, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", description: "Testnet ETH for development and testing on Sepolia network.", isClaimed: false, nextClaim: null, color: "border-blue-500/20 bg-blue-500/5" },
  { id: 2, network: "Polygon Mumbai", token: "MATIC", amount: "10", waitHours: 12, logo: "https://cryptologos.cc/logos/polygon-matic-logo.png", description: "Test MATIC tokens for Polygon Mumbai testnet.", isClaimed: true, nextClaim: new Date(Date.now() + 5 * 3600000).toISOString(), color: "border-violet-500/20 bg-violet-500/5" },
  { id: 3, network: "BNB Testnet", token: "BNB", amount: "1", waitHours: 24, logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png", description: "Test BNB for BSC testnet development.", isClaimed: false, nextClaim: null, color: "border-yellow-500/20 bg-yellow-500/5" },
  { id: 4, network: "Arbitrum Sepolia", token: "ETH", amount: "0.25", waitHours: 8, logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png", description: "ETH for Arbitrum Sepolia L2 testnet.", isClaimed: false, nextClaim: null, color: "border-cyan-500/20 bg-cyan-500/5" },
  { id: 5, network: "Avalanche Fuji", token: "AVAX", amount: "2", waitHours: 24, logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png", description: "AVAX for Fuji testnet C-Chain.", isClaimed: false, nextClaim: null, color: "border-red-500/20 bg-red-500/5" },
  { id: 6, network: "Optimism Sepolia", token: "ETH", amount: "0.25", waitHours: 6, logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png", description: "ETH for Optimism Sepolia testnet.", isClaimed: false, nextClaim: null, color: "border-rose-500/20 bg-rose-500/5" },
]

const EARN_TASKS = [
  { id: 1, title: "Follow on Twitter", reward: "50 WV Points", icon: Star, status: "available", difficulty: "Easy", time: "1 min" },
  { id: 2, title: "Join Discord Server", reward: "100 WV Points", icon: Trophy, status: "available", difficulty: "Easy", time: "2 min" },
  { id: 3, title: "Complete First Swap", reward: "200 WV Points", icon: Zap, status: "available", difficulty: "Medium", time: "5 min" },
  { id: 4, title: "Bridge to Arbitrum", reward: "500 WV Points", icon: Globe, status: "available", difficulty: "Medium", time: "10 min" },
  { id: 5, title: "Stake any Asset", reward: "300 WV Points", icon: Coins, status: "completed", difficulty: "Medium", time: "5 min" },
  { id: 6, title: "Refer 3 Friends", reward: "1500 WV Points", icon: Gift, status: "available", difficulty: "Hard", time: "Ongoing" },
]

export default function FreeTokens() {
  const [address, setAddress] = useState("")
  const [claimingId, setClaimingId] = useState<number | null>(null)
  const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set())

  const handleClaim = (id: number) => {
    if (!address) return
    setClaimingId(id)
    setTimeout(() => {
      setClaimingId(null)
      setClaimedIds(prev => new Set([...prev, id]))
    }, 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Coins className="w-8 h-8 text-yellow-400" /> Free Tokens
        </h1>
        <p className="text-white/60 mt-1">Claim testnet faucet tokens and earn rewards by completing tasks.</p>
      </div>

      {/* Wallet input */}
      <Card className="glass-panel border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <label className="text-xs text-white/50 font-medium block mb-2">Your Wallet Address</label>
              <Input
                placeholder="0x742d35Cc6634C0532925a3b8D4c0f0e86b73c2e4"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="h-12 bg-black/40 border-primary/20 font-mono text-sm"
              />
            </div>
            <div className="shrink-0 text-center sm:text-right">
              <p className="text-xs text-white/40 mb-1">Tokens claimed</p>
              <p className="text-2xl font-bold text-primary">{claimedIds.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faucets */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" /> Testnet Faucets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FAUCETS.map((faucet, i) => {
            const isClaimed = claimedIds.has(faucet.id) || faucet.isClaimed
            const isLoading = claimingId === faucet.id
            const nextClaimTime = faucet.nextClaim ? new Date(faucet.nextClaim).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

            return (
              <motion.div key={faucet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className={`glass-panel border ${faucet.color} flex flex-col h-full`}>
                  <CardContent className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={faucet.logo} alt={faucet.token} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold">{faucet.network}</p>
                          <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10 mt-0.5">Testnet</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold font-mono text-white">{faucet.amount}</p>
                        <p className="text-xs text-white/50">{faucet.token} / claim</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 flex-1">{faucet.description}</p>
                    <div className="flex items-center justify-between text-xs text-white/40 py-2 border-t border-white/5">
                      <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Cooldown: {faucet.waitHours}h</span>
                      {nextClaimTime && !claimedIds.has(faucet.id) && (
                        <span>Next: {nextClaimTime}</span>
                      )}
                    </div>
                    <WalletGateButton
                      className={`w-full font-bold transition-all ${isClaimed ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'}`}
                      disabled={isClaimed || isLoading || (faucet.nextClaim !== null && !claimedIds.has(faucet.id))}
                      onClick={() => handleClaim(faucet.id)}
                      action={`claim ${faucet.amount} ${faucet.token}`}
                    >
                      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> :
                       isClaimed ? <><CheckCircle2 className="w-4 h-4 mr-2" />Claimed!</> :
                       faucet.nextClaim && !claimedIds.has(faucet.id) ? <><Clock className="w-4 h-4 mr-2" />Cooldown Active</> :
                       `Claim ${faucet.amount} ${faucet.token}`}
                    </WalletGateButton>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Earn Tasks */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Earn by Completing Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EARN_TASKS.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`glass-panel transition-all ${task.status === 'completed' ? 'border-green-500/20 bg-green-500/5 opacity-70' : 'border-white/5 hover:border-white/15'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${task.status === 'completed' ? 'bg-green-500/20' : 'bg-white/5'}`}>
                    {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <task.icon className="w-5 h-5 text-white/60" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <Badge className={`text-[9px] px-1.5 py-0 ${task.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' : task.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                        {task.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40">⏱ {task.time} · 🎁 {task.reward}</p>
                  </div>
                  {task.status !== 'completed' ? (
                    <Button size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs gap-1 shrink-0">
                      Start <ArrowRight className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">Done</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
