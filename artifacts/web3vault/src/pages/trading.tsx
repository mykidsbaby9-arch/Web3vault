import { useState, useMemo } from "react"
import { useGetMarketTickers, useGetTokenChart, usePlaceOrder, useGetOrders, getGetMarketTickersQueryKey, getGetTokenChartQueryKey, getGetOrdersQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUp, ArrowDown, TrendingUp, Search } from "lucide-react"

export default function Trading() {
  const [selectedToken, setSelectedToken] = useState("BTC")
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [search, setSearch] = useState("")

  const { data: tickers } = useGetMarketTickers({
    query: { queryKey: getGetMarketTickersQueryKey(), refetchInterval: 5000 }
  })

  const { data: chartData } = useGetTokenChart(
    { symbol: selectedToken, period: "24h" },
    { query: { queryKey: getGetTokenChartQueryKey({ symbol: selectedToken, period: "24h" }) } }
  )

  const { data: orders } = useGetOrders(
    { status: "open" },
    { query: { queryKey: getGetOrdersQueryKey({ status: "open" }) } }
  )

  const placeOrder = usePlaceOrder()

  const currentTicker = useMemo(() => tickers?.find(t => t.symbol === selectedToken), [tickers, selectedToken])
  const filteredTickers = useMemo(() => tickers?.filter(t => t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())), [tickers, search])

  const handlePlaceOrder = () => {
    if (!currentTicker || !amount) return
    placeOrder.mutate({
      data: {
        side: orderSide,
        symbol: selectedToken,
        amount: Number(amount),
        price: currentTicker.price,
        network: "ethereum",
        orderType: "market"
      }
    })
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 animate-in fade-in duration-500">
      {/* Left Panel: Token List */}
      <Card className="glass-panel w-full lg:w-80 flex flex-col flex-shrink-0 h-full overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Search markets..." 
              className="pl-9 bg-black/40 border-white/5"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b border-white/5 bg-transparent p-0 h-10">
            <TabsTrigger value="all" className="flex-1 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none">All</TabsTrigger>
            <TabsTrigger value="gainers" className="flex-1 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none text-green-400">Gainers</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="flex-1 overflow-y-auto m-0 p-2 hide-scrollbar">
            {filteredTickers?.map(ticker => (
              <button 
                key={ticker.symbol}
                onClick={() => setSelectedToken(ticker.symbol)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${selectedToken === ticker.symbol ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">{ticker.symbol}</span>
                  <span className="text-xs text-white/40">{ticker.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm">${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                  <span className={`text-xs ${ticker.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ticker.changePercent24h >= 0 ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}
          </TabsContent>
          <TabsContent value="gainers" className="flex-1 overflow-y-auto m-0 p-2 hide-scrollbar">
            {filteredTickers?.filter(t => t.changePercent24h > 0)?.sort((a,b) => b.changePercent24h - a.changePercent24h).map(ticker => (
              <button 
                key={ticker.symbol}
                onClick={() => setSelectedToken(ticker.symbol)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${selectedToken === ticker.symbol ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">{ticker.symbol}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm">${ticker.price.toLocaleString()}</span>
                  <span className="text-xs text-green-400">+{ticker.changePercent24h.toFixed(2)}%</span>
                </div>
              </button>
            ))}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Center Panel: Chart & Data */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card className="glass-panel flex-1 flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentTicker && (
                <>
                  <img src={currentTicker.logoUrl} className="w-8 h-8 rounded-full" alt={currentTicker.symbol} />
                  <div>
                    <h2 className="text-xl font-bold">{currentTicker.symbol}/USD</h2>
                    <div className="text-sm text-white/50">{currentTicker.name}</div>
                  </div>
                  <div className="ml-4 pl-4 border-l border-white/10">
                    <div className="text-2xl font-mono font-bold">${currentTicker.price.toLocaleString()}</div>
                    <div className={`text-sm flex items-center ${currentTicker.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentTicker.changePercent24h >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {Math.abs(currentTicker.changePercent24h).toFixed(2)}%
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {["1H", "1D", "1W", "1M"].map(tf => (
                <Button key={tf} variant={tf === "1D" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs">{tf}</Button>
              ))}
            </div>
          </div>
          {/* Chart */}
          <div className="flex-1 min-h-[300px] p-4">
            {chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentTicker && currentTicker.changePercent24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={currentTicker && currentTicker.changePercent24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke={currentTicker && currentTicker.changePercent24h >= 0 ? "#10b981" : "#ef4444"} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">Loading chart...</div>
            )}
          </div>
        </Card>

        {/* Open Orders */}
        <Card className="glass-panel h-48 flex-shrink-0 flex flex-col">
          <CardHeader className="py-3 px-4 border-b border-white/5">
            <CardTitle className="text-sm">Open Orders</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-0">
            {orders?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40 text-sm">No open orders</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-white/40 text-xs text-left sticky top-0 bg-[#0B1220]/90 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-2 font-medium">Pair</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Side</th>
                    <th className="px-4 py-2 font-medium">Price</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map(order => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-2 font-bold">{order.symbol}/USD</td>
                      <td className="px-4 py-2">Market</td>
                      <td className={`px-4 py-2 font-bold ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{order.side.toUpperCase()}</td>
                      <td className="px-4 py-2 font-mono">${order.price.toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Right Panel: Order Entry */}
      <Card className="glass-panel w-full lg:w-80 flex flex-col flex-shrink-0">
        <div className="p-4 flex gap-2 border-b border-white/5">
          <Button 
            className={`flex-1 font-bold text-lg h-12 ${orderSide === 'buy' ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-transparent border border-white/10 text-white/60 hover:text-white'}`}
            onClick={() => setOrderSide('buy')}
          >
            Buy
          </Button>
          <Button 
            className={`flex-1 font-bold text-lg h-12 ${orderSide === 'sell' ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-transparent border border-white/10 text-white/60 hover:text-white'}`}
            onClick={() => setOrderSide('sell')}
          >
            Sell
          </Button>
        </div>
        <CardContent className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">Order Type</span>
            <Badge variant="outline" className="border-white/20 bg-white/5">Market</Badge>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Amount ({selectedToken})</span>
                <span className="text-white/60">Balance: 0.00</span>
              </div>
              <div className="relative">
                <Input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="h-12 bg-black/40 border-white/10 text-lg pr-16" 
                  placeholder="0.00" 
                />
                <Button size="sm" variant="ghost" className="absolute right-1 top-1.5 h-9 text-xs text-primary hover:text-primary/80">MAX</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(pct => (
                <Button key={pct} variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-xs">
                  {pct}%
                </Button>
              ))}
            </div>
            
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-sm mt-4">
              <div className="flex justify-between">
                <span className="text-white/40">Price</span>
                <span className="font-mono">~${currentTicker?.price.toLocaleString() ?? '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Total USD</span>
                <span className="font-mono font-bold text-white">
                  ${((Number(amount) || 0) * (currentTicker?.price || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          
          <WalletGateButton 
            size="lg" 
            className={`w-full h-14 text-lg font-bold mt-auto ${orderSide === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            disabled={!amount || Number(amount) <= 0 || placeOrder.isPending}
            onClick={handlePlaceOrder}
            action={`${orderSide === 'buy' ? 'buy' : 'sell'} ${selectedToken}`}
          >
            {placeOrder.isPending ? 'Processing...' : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${selectedToken}`}
          </WalletGateButton>
        </CardContent>
      </Card>
    </div>
  )
}