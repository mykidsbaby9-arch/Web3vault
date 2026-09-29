import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Network, ShieldCheck, Zap } from "lucide-react"
import { formatDemoAge } from "@/lib/demo-time"

type LiveTx = {
  id: string
  type: "swap" | "bridge" | "receive" | "send" | "stake" | "claim"
  from: string
  to: string
  amount: string
  token: string
  token2?: string
  network: string
  ts: number
}

const TOKENS = ["ETH", "BTC", "SOL", "MATIC", "AVAX", "USDC", "ARB", "OP", "BNB", "LINK"]
const NETWORKS = ["ethereum", "arbitrum", "polygon", "optimism", "base", "avalanche"]
const TYPES: LiveTx["type"][] = ["swap", "bridge", "receive", "send", "stake", "claim"]
const ADDRS = ["0x1a2b...3c4d", "0x9f8e...7d6c", "0xabcd...ef01", "0x5544...3322", "0xdead...beef", "0xcafe...1234"]

function makeAddr() {
  return ADDRS[Math.floor(Math.random() * ADDRS.length)]
}
function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function makeTx(): LiveTx {
  const type = rand(TYPES)
  const token = rand(TOKENS)
  const token2 = rand(TOKENS.filter(t => t !== token))
  const amount = (Math.random() * 10 + 0.01).toFixed(4)
  return {
    id: Math.random().toString(36).slice(2),
    type, from: makeAddr(), to: makeAddr(),
    amount, token, token2, network: rand(NETWORKS), ts: Date.now() - (2 + Math.floor(Math.random() * 29)) * 60_000,
  }
}

const TYPE_CONFIG: Record<LiveTx["type"], { icon: React.ReactNode; color: string; label: (tx: LiveTx) => string }> = {
  swap:    { icon: <RefreshCw className="w-3.5 h-3.5" />, color: "text-primary bg-primary/10 border-primary/20", label: tx => `Swapped ${tx.amount} ${tx.token} → ${tx.token2}` },
  bridge:  { icon: <Network className="w-3.5 h-3.5" />, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", label: tx => `Bridged ${tx.amount} ${tx.token}` },
  receive: { icon: <ArrowDownRight className="w-3.5 h-3.5" />, color: "text-green-400 bg-green-400/10 border-green-400/20", label: tx => `Received ${tx.amount} ${tx.token}` },
  send:    { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-400/10 border-red-400/20", label: tx => `Sent ${tx.amount} ${tx.token}` },
  stake:   { icon: <Zap className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", label: tx => `Staked ${tx.amount} ${tx.token}` },
  claim:   { icon: <ShieldCheck className="w-3.5 h-3.5" />, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", label: tx => `Claimed ${tx.amount} ${tx.token}` },
}

export function LiveTxFeed({ maxItems = 8 }: { maxItems?: number }) {
  const [txs, setTxs] = useState<LiveTx[]>(() => Array.from({ length: 5 }, makeTx))

  useEffect(() => {
    const interval = setInterval(() => {
      const tx = makeTx()
      setTxs(prev => [tx, ...prev].slice(0, maxItems))
    }, 2200)
    return () => clearInterval(interval)
  }, [maxItems])

  return (
    <div className="space-y-1.5 overflow-hidden">
      <AnimatePresence initial={false}>
        {txs.map(tx => {
          const cfg = TYPE_CONFIG[tx.type]
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.025] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className={`flex-shrink-0 p-1.5 rounded-md border ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/90 truncate">{cfg.label(tx)}</div>
                <div className="text-[10px] text-white/40 font-mono truncate">{tx.from} · {tx.network}</div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1">
                <span className="text-[10px] text-white/30" data-testid={`text-demo-tx-time-${tx.id}`}>
                  Demo · {formatDemoAge(tx.ts)}
                </span>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
