import { seededDemoAge } from "@/lib/demo-time"
import { useGetPortfolioSummary, useGetPortfolioHoldings, useGetTransactions, getGetPortfolioSummaryQueryKey, getGetPortfolioHoldingsQueryKey, getGetTransactionsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight, ArrowDownRight, Wallet, ShieldCheck, Activity, ArrowRight,
  ShieldAlert, ArrowLeftRight, Network, Zap, Gift, Trophy, PieChart,
  Image as ImageIcon, BarChart2, Key, Coins, Layers, History,
} from "lucide-react"
import { Link } from "wouter"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"
import { LiveTxFeed } from "@/components/shared/live-tx-feed"
import { motion } from "framer-motion"

const SERVICES = [
  { name: "Wallet Guard", href: "/wallet-guard", icon: ShieldAlert, color: "from-red-500/20 to-orange-500/10 border-red-500/20", iconColor: "text-red-400", desc: "Scan for risks" },
  { name: "Token Swap", href: "/swap", icon: ArrowLeftRight, color: "from-primary/20 to-blue-500/10 border-primary/20", iconColor: "text-primary", desc: "Best price swaps" },
  { name: "Claim Airdrop", href: "/airdrops", icon: Gift, color: "from-purple-500/20 to-pink-500/10 border-purple-500/20", iconColor: "text-purple-400", desc: "Free tokens" },
  { name: "Staking", href: "/staking", icon: Zap, color: "from-yellow-500/20 to-orange-500/10 border-yellow-500/20", iconColor: "text-yellow-400", desc: "Earn yield" },
  { name: "Bridge", href: "/bridge", icon: Network, color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20", iconColor: "text-cyan-400", desc: "Cross-chain" },
  { name: "NFT Vault", href: "/nfts", icon: ImageIcon, color: "from-violet-500/20 to-purple-500/10 border-violet-500/20", iconColor: "text-violet-400", desc: "Your collection" },
  { name: "DeFi Hub", href: "/defi-hub", icon: Layers, color: "from-secondary/20 to-cyan-500/10 border-secondary/20", iconColor: "text-secondary", desc: "Top protocols" },
  { name: "Analytics", href: "/analytics", icon: BarChart2, color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20", iconColor: "text-blue-400", desc: "Market data" },
  { name: "Recovery", href: "/recovery", icon: Key, color: "from-orange-500/20 to-yellow-500/10 border-orange-500/20", iconColor: "text-orange-400", desc: "Restore wallet" },
  { name: "Rewards", href: "/rewards", icon: Trophy, color: "from-amber-500/20 to-yellow-500/10 border-amber-500/20", iconColor: "text-amber-400", desc: "Earn points" },
  { name: "Free Tokens", href: "/free-tokens", icon: Coins, color: "from-green-500/20 to-emerald-500/10 border-green-500/20", iconColor: "text-green-400", desc: "Faucets & tasks" },
  { name: "Portfolio", href: "/portfolio", icon: PieChart, color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/20", iconColor: "text-indigo-400", desc: "P&L tracker" },
]

export default function Dashboard() {
  const { address } = useWallet()

  const { data: summary, isLoading: isLoadingSummary } = useGetPortfolioSummary({
    query: { queryKey: getGetPortfolioSummaryQueryKey(), refetchInterval: 30_000 }
  })

  const { data: holdings, isLoading: isLoadingHoldings } = useGetPortfolioHoldings({
    query: { queryKey: getGetPortfolioHoldingsQueryKey(), refetchInterval: 30_000 }
  })

  const { data: txData, isLoading: isLoadingTx } = useGetTransactions(
    { limit: 5 },
    { query: { queryKey: getGetTransactionsQueryKey({ limit: 5 }), refetchInterval: 15_000 } }
  )

  const isPositive = (summary?.dayChangePercent ?? 0) >= 0

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-white/60 mt-1">
            {address ? `Welcome back, ${address.slice(0, 6)}…${address.slice(-4)}` : "Welcome to your command center."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/swap">
            <Button className="glass-card bg-primary/20 text-primary hover:bg-primary/30 border-primary/20 gap-2 text-sm">
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </Button>
          </Link>
          <Link href="/bridge">
            <Button className="glass-card bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/20 gap-2 text-sm">
              <Network className="w-4 h-4" /> Bridge
            </Button>
          </Link>
        </div>
      </div>

      {/* Portfolio Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 glass-panel border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
          <CardContent className="p-8">
            <div className="flex flex-col gap-2">
              <span className="text-white/60 font-medium text-sm">Total Balance</span>
              {isLoadingSummary ? (
                <Skeleton className="h-12 w-48 bg-white/10" />
              ) : (
                <div className="flex items-baseline gap-4 flex-wrap">
                  <h2 className="text-4xl md:text-5xl font-bold font-mono">
                    ${summary?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <Badge variant="glass" className={isPositive ? "text-green-400 border-green-400/20" : "text-red-400 border-red-400/20"}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(summary?.dayChangePercent ?? 0).toFixed(2)}%
                  </Badge>
                </div>
              )}
              {summary && (
                <span className={`text-sm ${isPositive ? "text-green-400/80" : "text-red-400/80"}`}>
                  {isPositive ? "+" : "-"}${Math.abs(summary.dayChange).toLocaleString()} today
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
              <div>
                <div className="text-white/40 text-xs mb-1">Network</div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Ethereum
                </div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-1">Security</div>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <ShieldCheck className="w-4 h-4" /> Secure
                </div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-1">Active Positions</div>
                <div className="text-sm text-white/80">{holdings?.length || 0} Assets</div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-1">Total P&L</div>
                <div className={`font-mono text-sm ${summary && summary.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {summary && summary.pnl >= 0 ? "+" : "-"}${Math.abs(summary?.pnl || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Transaction Feed */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </div>
              Live Network Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <LiveTxFeed maxItems={7} />
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Services</h2>
          <span className="text-xs text-white/40">{SERVICES.length} available</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SERVICES.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={s.href}>
                <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border bg-gradient-to-br ${s.color} hover:scale-[1.03] transition-all cursor-pointer group text-center`}>
                  <div className={`p-2.5 rounded-xl bg-black/30 group-hover:bg-black/20 transition-colors`}>
                    <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{s.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Holdings + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Top Holdings</CardTitle>
            <Link href="/portfolio" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              {isLoadingHoldings ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/10 rounded-lg" />)
              ) : holdings?.slice(0, 5).map((token) => (
                <div key={token.symbol} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full" onError={e => (e.currentTarget.style.display = 'none')} />
                    <div>
                      <div className="font-medium text-sm">{token.symbol}</div>
                      <div className="text-xs text-white/40 font-mono">{token.balance} {token.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm font-mono">${token.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className={`text-xs ${token.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {token.pnlPercent >= 0 ? "+" : ""}{token.pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Transactions
            </CardTitle>
            <Link href="/transactions" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              {isLoadingTx ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/10 rounded-lg" />)
              ) : txData?.items?.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === "receive" ? "bg-green-500/10 text-green-400" :
                      tx.type === "send" ? "bg-red-500/10 text-red-400" :
                      tx.type === "swap" ? "bg-primary/10 text-primary" :
                      tx.type === "bridge" ? "bg-cyan-500/10 text-cyan-400" :
                      "bg-white/5 text-white/60"
                    }`}>
                      {tx.type === "receive" ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                       tx.type === "send" ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                       <Activity className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm capitalize">{tx.type}</div>
                      <div className="text-xs text-white/40">
                        {seededDemoAge("transactions", tx.id, tx.timestamp) ?? new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm font-mono">
                      {tx.type === "send" ? "-" : tx.type === "receive" ? "+" : ""}{tx.amount} {tx.token}
                    </div>
                    {tx.amountUsd && (
                      <div className="text-xs text-white/40 font-mono">${tx.amountUsd.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              ))}
              {txData?.items?.length === 0 && (
                <div className="text-center text-white/40 py-8 text-sm">No transactions yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
