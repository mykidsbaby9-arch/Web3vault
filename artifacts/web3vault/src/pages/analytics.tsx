import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart2, TrendingUp, TrendingDown, Globe, Activity, DollarSign, Zap, Users } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { motion } from "framer-motion"

const PERIODS = ["24h", "7d", "30d", "90d", "1y"]

function generateChartData(days: number, base: number, volatility: number) {
  const data = []
  let v = base
  for (let i = days; i >= 0; i--) {
    v = v * (1 + (Math.random() - 0.47) * volatility)
    const d = new Date(Date.now() - i * 86400000)
    data.push({ date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), value: +v.toFixed(2), volume: +(Math.random() * 2000000000 + 500000000).toFixed(0) })
  }
  return data
}

const marketData = generateChartData(30, 1_200_000_000_000, 0.03)
const fearData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  value: Math.floor(30 + Math.random() * 50),
}))

const DOMINANCE = [
  { name: "BTC", value: 53.4, color: "#F7931A" },
  { name: "ETH", value: 17.2, color: "#627EEA" },
  { name: "BNB", value: 3.8, color: "#F3BA2F" },
  { name: "SOL", value: 3.2, color: "#9945FF" },
  { name: "Others", value: 22.4, color: "#334155" },
]

const CHAIN_METRICS = [
  { chain: "Ethereum", txs: "1.2M", tps: "14.2", gas: "12 gwei", tvl: "$42B", status: "green" },
  { chain: "Arbitrum", txs: "620K", tps: "40K+", gas: "0.1 gwei", tvl: "$8.2B", status: "green" },
  { chain: "Optimism", txs: "290K", tps: "2000+", gas: "0.2 gwei", tvl: "$4.1B", status: "green" },
  { chain: "Polygon", txs: "3.1M", tps: "65K+", gas: "30 gwei", tvl: "$1.3B", status: "green" },
  { chain: "BNB Chain", txs: "4.2M", tps: "2000+", gas: "1 gwei", tvl: "$5.8B", status: "green" },
  { chain: "Avalanche", txs: "180K", tps: "4500+", gas: "25 nAVAX", tvl: "$2.1B", status: "green" },
]

const TOP_GAINERS = [
  { symbol: "DOGE", name: "Dogecoin", change: "+18.4%", price: "$0.18" },
  { symbol: "SOL", name: "Solana", change: "+12.1%", price: "$185.7" },
  { symbol: "ARB", name: "Arbitrum", change: "+9.8%", price: "$1.24" },
  { symbol: "OP", name: "Optimism", change: "+8.3%", price: "$2.87" },
  { symbol: "AVAX", name: "Avalanche", change: "+7.2%", price: "$41.2" },
]

const TOP_LOSERS = [
  { symbol: "XRP", name: "Ripple", change: "-6.4%", price: "$0.52" },
  { symbol: "ADA", name: "Cardano", change: "-4.9%", price: "$0.41" },
  { symbol: "LTC", name: "Litecoin", change: "-3.2%", price: "$91.2" },
  { symbol: "DOT", name: "Polkadot", change: "-2.8%", price: "$9.12" },
  { symbol: "UNI", name: "Uniswap", change: "-2.1%", price: "$11.2" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1220] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-white/50 mb-1">{label}</p>
        <p className="text-white font-mono font-bold">${Number(payload[0].value).toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [period, setPeriod] = useState("30d")
  const currentFear = fearData[fearData.length - 1].value
  const fearLabel = currentFear < 25 ? "Extreme Fear" : currentFear < 45 ? "Fear" : currentFear < 55 ? "Neutral" : currentFear < 75 ? "Greed" : "Extreme Greed"
  const fearColor = currentFear < 25 ? "#EF4444" : currentFear < 45 ? "#F97316" : currentFear < 55 ? "#EAB308" : currentFear < 75 ? "#22C55E" : "#10B981"

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-primary" /> Market Analytics
        </h1>
        <p className="text-white/60 mt-1">Live on-chain data, market dominance, and cross-chain analytics.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Market Cap", value: "$2.41T", change: "+2.4%", up: true, icon: DollarSign },
          { label: "24h Volume", value: "$98.3B", change: "+12.8%", up: true, icon: Activity },
          { label: "BTC Dominance", value: "53.4%", change: "-0.3%", up: false, icon: TrendingUp },
          { label: "DeFi TVL", value: "$99.2B", change: "+4.1%", up: true, icon: Zap },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-panel">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">{m.label}</span>
                  <m.icon className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-2xl font-bold font-mono">{m.value}</p>
                <p className={`text-xs font-mono mt-1 ${m.up ? 'text-green-400' : 'text-red-400'}`}>{m.change} (24h)</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Cap Chart */}
        <Card className="glass-panel lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Global Market Cap</CardTitle>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-primary text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>{p}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={marketData.slice(-30)}>
                <defs>
                  <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1e12).toFixed(1)}T`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#marketGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fear & Greed + Dominance */}
        <div className="space-y-4">
          <Card className="glass-panel">
            <CardHeader className="pb-2"><CardTitle className="text-base">Fear & Greed Index</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="14" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={fearColor} strokeWidth="14"
                      strokeDasharray={`${2 * Math.PI * 50 * (currentFear / 100)} ${2 * Math.PI * 50 * (1 - currentFear / 100)}`}
                      className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                    <span className="text-3xl font-black" style={{ color: fearColor }}>{currentFear}</span>
                    <span className="text-[10px] text-white/50">/ 100</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg" style={{ color: fearColor }}>{fearLabel}</p>
                  <p className="text-xs text-white/40">Updated daily</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="pb-2"><CardTitle className="text-base">Market Dominance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {DOMINANCE.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-12 font-mono">{d.name}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-xs font-mono text-white/70 w-10 text-right">{d.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gainers / Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-green-400" /> Top Gainers (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_GAINERS.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-4">{i + 1}</span>
                    <div>
                      <p className="font-bold text-sm">{t.symbol}</p>
                      <p className="text-xs text-white/40">{t.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm">{t.price}</p>
                    <p className="text-xs text-green-400 font-mono">{t.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><TrendingDown className="w-4 h-4 text-red-400" /> Top Losers (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_LOSERS.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-4">{i + 1}</span>
                    <div>
                      <p className="font-bold text-sm">{t.symbol}</p>
                      <p className="text-xs text-white/40">{t.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm">{t.price}</p>
                    <p className="text-xs text-red-400 font-mono">{t.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain Metrics */}
      <Card className="glass-panel">
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-secondary" /> Chain Health Monitor</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-3 px-4 font-medium">Chain</th>
                  <th className="text-right py-3 px-4 font-medium">24h Txns</th>
                  <th className="text-right py-3 px-4 font-medium">TPS</th>
                  <th className="text-right py-3 px-4 font-medium">Gas</th>
                  <th className="text-right py-3 px-4 font-medium">TVL</th>
                  <th className="text-right py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {CHAIN_METRICS.map(c => (
                  <tr key={c.chain} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold">{c.chain}</td>
                    <td className="py-3 px-4 text-right font-mono text-white/80">{c.txs}</td>
                    <td className="py-3 px-4 text-right font-mono text-white/80">{c.tps}</td>
                    <td className="py-3 px-4 text-right font-mono text-white/60 text-xs">{c.gas}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{c.tvl}</td>
                    <td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-green-400">Live</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
