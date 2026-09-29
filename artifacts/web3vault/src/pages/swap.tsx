import { useState } from "react"
import { seededDemoAge } from "@/lib/demo-time"
import { useGetMarketTickers, useGetSwapQuote, useExecuteSwap, useGetSwapHistory, getGetMarketTickersQueryKey, getGetSwapHistoryQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowDownUp, Settings2, Info, ChevronDown, CheckCircle2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"

export default function Swap() {
  const { address } = useWallet()
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("USDC")
  const [amount, setAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)

  const { data: tokens, isLoading: isLoadingTokens } = useGetMarketTickers({
    query: { queryKey: getGetMarketTickersQueryKey() }
  })

  const { data: history, isLoading: isLoadingHistory } = useGetSwapHistory({
    query: { queryKey: getGetSwapHistoryQueryKey() }
  })

  const getQuote = useGetSwapQuote()
  const executeSwap = useExecuteSwap()

  const handleGetQuote = () => {
    if (!amount || Number(amount) <= 0) return
    getQuote.mutate({
      data: {
        fromToken,
        toToken,
        amount: Number(amount),
        network: "ethereum",
        slippage
      }
    })
  }

  const handleSwap = () => {
    if (!address || !amount || Number(amount) <= 0) return
    executeSwap.mutate({
      data: {
        fromToken,
        toToken,
        fromAmount: Number(amount),
        network: "ethereum",
        walletAddress: address,
        slippage
      }
    })
  }

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setAmount("")
    getQuote.reset()
  }

  const currentQuote = getQuote.data

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Swap</h1>
        <p className="text-white/60">Zero-slippage routing across all DEXs.</p>
      </div>

      <Card className="glass-panel p-2">
        <CardContent className="p-4 flex flex-col gap-2 relative">
          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-sm font-medium text-white/60">Swap</span>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-white/60 hover:text-white rounded-full">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>

          {/* From Box */}
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-white/40 font-medium">You Pay</span>
              <span className="text-xs text-white/40">Balance: 1.45 {fromToken}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                type="number" 
                placeholder="0.00" 
                className="text-3xl bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white font-mono placeholder:text-white/20"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  getQuote.reset()
                }}
                onBlur={handleGetQuote}
              />
              <Button variant="outline" className="shrink-0 h-10 px-3 gap-2 bg-white/5 border-white/10 rounded-xl hover:bg-white/10 text-white font-bold">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">{fromToken[0]}</div>
                {fromToken} <ChevronDown className="w-4 h-4 text-white/50" />
              </Button>
            </div>
            <div className="text-xs text-white/40 mt-1 font-mono">
              ~${(Number(amount) * 3500).toFixed(2)}
            </div>
          </div>

          {/* Switch Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl w-10 h-10 bg-[#0B1220] border-white/10 text-white hover:bg-white/10 hover:text-primary transition-all group shadow-xl"
              onClick={switchTokens}
            >
              <ArrowDownUp className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </Button>
          </div>

          {/* To Box */}
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-white/40 font-medium">You Receive</span>
              <span className="text-xs text-white/40">Balance: 450.00 {toToken}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                type="text" 
                placeholder="0.00" 
                className="text-3xl bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white font-mono placeholder:text-white/20"
                readOnly
                value={currentQuote?.toAmount ? currentQuote.toAmount.toFixed(6) : ""}
              />
              <Button variant="outline" className="shrink-0 h-10 px-3 gap-2 bg-primary/10 border-primary/20 rounded-xl hover:bg-primary/20 text-primary font-bold">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-white">{toToken[0]}</div>
                {toToken} <ChevronDown className="w-4 h-4 text-primary/50" />
              </Button>
            </div>
            {currentQuote && (
              <div className="text-xs text-white/40 mt-1 font-mono flex items-center gap-2">
                ~${(currentQuote.toAmount * 1).toFixed(2)}
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentQuote.priceImpact < 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {currentQuote.priceImpact}% impact
                </span>
              </div>
            )}
          </div>

          {/* Quote Details */}
          {currentQuote && (
            <div className="mt-4 p-4 rounded-xl border border-white/5 space-y-3 bg-white/[0.02]">
              <div className="flex justify-between text-sm">
                <span className="text-white/50 flex items-center gap-1"><Info className="w-3 h-3" /> Exchange Rate</span>
                <span className="font-mono font-medium">1 {fromToken} = {currentQuote.exchangeRate.toFixed(6)} {toToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Network Fee</span>
                <span className="font-mono text-white/80">~${currentQuote.gasFeeUsd?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Route</span>
                <span className="text-primary text-xs font-medium flex items-center gap-1">
                  {currentQuote.route.join(" > ")}
                </span>
              </div>
            </div>
          )}

          <WalletGateButton 
            size="lg" 
            className="w-full h-14 text-lg font-bold mt-4 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            disabled={!amount || Number(amount) <= 0 || getQuote.isPending || executeSwap.isPending}
            onClick={currentQuote ? handleSwap : handleGetQuote}
            action="swap tokens"
          >
            {getQuote.isPending ? 'Fetching Best Price...' : 
             executeSwap.isPending ? 'Executing Swap...' : 
             executeSwap.isSuccess ? 'Swap Successful!' :
             currentQuote ? 'Execute Swap' : 'Review Swap'}
          </WalletGateButton>
        </CardContent>
      </Card>

      {/* Recent Swaps */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2">Recent Swaps</h3>
        {isLoadingHistory ? (
           Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : history?.length === 0 ? (
          <div className="text-center p-8 border border-white/5 rounded-2xl glass-panel text-white/40">No recent swaps found</div>
        ) : (
          <div className="space-y-2">
            {history?.map((swap) => (
              <div key={swap.id} className="flex items-center justify-between p-4 glass-panel rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ring-2 ring-[#0B1220] z-10">{swap.fromToken[0]}</div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-[#0B1220] z-0">{swap.toToken[0]}</div>
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {swap.fromToken} <ArrowRight className="w-3 h-3 text-white/40" /> {swap.toToken}
                    </div>
                    <div className="text-xs text-white/40" data-testid={`text-swap-time-${swap.id}`}>
                      {seededDemoAge("swaps", swap.id, swap.createdAt) ?? new Date(swap.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium">{swap.fromAmount} {swap.fromToken}</div>
                  <div className="flex items-center justify-end gap-1 text-xs text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
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