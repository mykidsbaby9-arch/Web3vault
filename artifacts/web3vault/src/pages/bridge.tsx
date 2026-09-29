import { seededDemoAge } from "@/lib/demo-time"
import { useState } from "react"
import { useGetBridgeQuote, useExecuteBridge, useGetBridgeHistory, getGetBridgeHistoryQueryKey } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Input } from "@/components/ui/input"
import { Network, ArrowDown, ChevronDown, Clock, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"

const NETWORKS = ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "BNB Chain"]

export default function Bridge() {
  const { address } = useWallet()
  const [fromNetwork, setFromNetwork] = useState("Ethereum")
  const [toNetwork, setToNetwork] = useState("Arbitrum")
  const [token, setToken] = useState("ETH")
  const [amount, setAmount] = useState("")

  const { data: history, isLoading: isLoadingHistory } = useGetBridgeHistory({
    query: { queryKey: getGetBridgeHistoryQueryKey() }
  })

  const getQuote = useGetBridgeQuote()
  const executeBridge = useExecuteBridge()

  const handleGetQuote = () => {
    if (!amount || Number(amount) <= 0) return
    getQuote.mutate({
      data: {
        fromNetwork,
        toNetwork,
        token,
        amount: Number(amount)
      }
    })
  }

  const handleBridge = () => {
    if (!address || !amount || Number(amount) <= 0) return
    executeBridge.mutate({
      data: {
        fromNetwork,
        toNetwork,
        token,
        amount: Number(amount),
        walletAddress: address
      }
    })
  }

  const quote = getQuote.data

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-3">
          <Network className="w-8 h-8 text-secondary" /> Omni-Bridge
        </h1>
        <p className="text-white/60">Transfer assets seamlessly across 14+ networks with unified liquidity.</p>
      </div>

      <Card className="glass-panel border-secondary/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
        <CardContent className="p-6 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Network */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 px-1">From Network</label>
              <Button variant="outline" className="w-full justify-between h-14 bg-black/40 border-white/10 hover:bg-white/5 hover:border-secondary/50 text-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20" />
                  {fromNetwork}
                </div>
                <ChevronDown className="w-4 h-4 text-white/40" />
              </Button>
            </div>
            
            {/* To Network */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 px-1">To Network</label>
              <Button variant="outline" className="w-full justify-between h-14 bg-black/40 border-white/10 hover:bg-white/5 hover:border-secondary/50 text-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20" />
                  {toNetwork}
                </div>
                <ChevronDown className="w-4 h-4 text-white/40" />
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center -my-3 z-10 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-[#0B1220] border border-secondary/30 flex items-center justify-center text-secondary">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-white/40 font-medium">Send Amount</span>
              <span className="text-xs text-secondary/80 font-medium cursor-pointer">Use Max</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                type="number" 
                placeholder="0.00" 
                className="text-4xl bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white font-mono placeholder:text-white/20"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  getQuote.reset()
                }}
                onBlur={handleGetQuote}
              />
              <Button variant="outline" className="shrink-0 h-12 px-4 gap-2 bg-secondary/10 border-secondary/20 rounded-xl hover:bg-secondary/20 text-secondary font-bold text-lg">
                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs text-white">{token[0]}</div>
                {token} <ChevronDown className="w-4 h-4 text-secondary/50" />
              </Button>
            </div>
          </div>

          {/* Quote details */}
          {quote && (
             <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">You will receive</span>
                <span className="font-mono font-bold text-lg text-white">{quote.receiveAmount.toFixed(4)} {token}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Time</span>
                <span className="text-white/80">{quote.estimatedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Bridge Fee</span>
                <span className="font-mono text-white/80">${quote.bridgeFeeUsd?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Gas Fee (Dest)</span>
                <span className="font-mono text-white/80">${quote.gasFeeUsd?.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>
          )}

          <WalletGateButton 
            size="lg" 
            className="w-full h-14 text-lg font-bold rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            disabled={!amount || Number(amount) <= 0 || getQuote.isPending || executeBridge.isPending}
            onClick={quote ? handleBridge : handleGetQuote}
            action="bridge assets"
          >
            {getQuote.isPending ? 'Finding Route...' : 
             executeBridge.isPending ? 'Bridging Assets...' : 
             executeBridge.isSuccess ? 'Bridge Initiated!' :
             quote ? 'Confirm Bridge' : 'Review Bridge'}
          </WalletGateButton>

          <div className="flex items-center justify-center gap-2 text-xs text-white/40">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Audited by top security firms. Assets are fully backed.
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2">Bridge History</h3>
        {isLoadingHistory ? (
           Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : history?.length === 0 ? (
          <div className="text-center p-8 border border-white/5 rounded-2xl glass-panel text-white/40">No recent bridge transactions</div>
        ) : (
          <div className="space-y-3">
             {history?.map((tx) => (
                <div key={tx.id} className="p-4 glass-panel border-white/5 hover:border-white/10 rounded-xl transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-2 text-sm font-medium">
                         <span className="text-white/60">{tx.fromNetwork}</span>
                         <ArrowRight className="w-3 h-3 text-secondary" />
                         <span className="text-white">{tx.toNetwork}</span>
                       </div>
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'destructive'} className="uppercase text-[10px]">
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="font-mono text-lg font-bold">{tx.amount} {tx.token}</div>
                    <div className="text-xs text-white/40">
                      {seededDemoAge("bridges", tx.id, tx.createdAt) ?? new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ArrowRight(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}