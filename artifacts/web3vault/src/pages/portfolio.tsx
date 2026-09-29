import { useState } from "react"
import { useGetPortfolioSummary, useGetPortfolioHistory, useGetPortfolioHoldings, getGetPortfolioSummaryQueryKey, getGetPortfolioHistoryQueryKey, getGetPortfolioHoldingsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, LineChart as LineChartIcon, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Portfolio() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [view, setView] = useState<"chart" | "allocations">("chart")

  const { data: summary, isLoading: isLoadingSummary } = useGetPortfolioSummary({
    query: { queryKey: getGetPortfolioSummaryQueryKey() }
  })
  
  const { data: history, isLoading: isLoadingHistory } = useGetPortfolioHistory(
    { period },
    { query: { queryKey: getGetPortfolioHistoryQueryKey({ period }) } }
  )

  const { data: holdings, isLoading: isLoadingHoldings } = useGetPortfolioHoldings({
    query: { queryKey: getGetPortfolioHoldingsQueryKey() }
  })

  const isPositive = (summary?.pnl ?? 0) >= 0
  const isDayPositive = (summary?.dayChange ?? 0) >= 0

  const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#F97316', '#8B5CF6']

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-white/60 mt-1">Deep analytics across all your assets and networks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-white/5 md:col-span-2">
           <CardContent className="p-6">
             <div className="text-white/40 text-sm mb-1 uppercase tracking-widest">Net Worth</div>
             {isLoadingSummary ? (
               <Skeleton className="h-10 w-40 bg-white/10" />
             ) : (
               <div className="flex items-baseline gap-3">
                 <div className="text-4xl font-bold font-mono text-white">${summary?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                 <div className={`text-sm font-medium px-2 py-0.5 rounded-full ${isDayPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                   {isDayPositive ? '+' : ''}{summary?.dayChangePercent.toFixed(2)}%
                 </div>
               </div>
             )}
           </CardContent>
        </Card>
        
        <Card className="glass-panel border-white/5">
           <CardContent className="p-6">
             <div className="text-white/40 text-sm mb-1 uppercase tracking-widest">All Time P&L</div>
             {isLoadingSummary ? (
               <Skeleton className="h-10 w-24 bg-white/10" />
             ) : (
               <div className={`text-2xl font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                 {isPositive ? '+' : '-'}${Math.abs(summary?.pnl || 0).toLocaleString()}
               </div>
             )}
           </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
           <CardContent className="p-6">
             <div className="text-white/40 text-sm mb-1 uppercase tracking-widest">Total Cost</div>
             {isLoadingSummary ? (
               <Skeleton className="h-10 w-24 bg-white/10" />
             ) : (
               <div className="text-2xl font-bold font-mono text-white/80">
                 ${summary?.totalCost.toLocaleString()}
               </div>
             )}
           </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
             <Button variant="ghost" size="sm" className={`h-8 ${view === 'chart' ? 'bg-white/10' : ''}`} onClick={() => setView('chart')}>
               <LineChartIcon className="w-4 h-4 mr-2" /> Performance
             </Button>
             <Button variant="ghost" size="sm" className={`h-8 ${view === 'allocations' ? 'bg-white/10' : ''}`} onClick={() => setView('allocations')}>
               <PieChartIcon className="w-4 h-4 mr-2" /> Allocation
             </Button>
          </div>
          {view === 'chart' && (
            <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
              <TabsList className="bg-black/40 border border-white/5 h-10 p-1">
                <TabsTrigger value="7d" className="text-xs px-3 data-[state=active]:bg-white/10">7D</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs px-3 data-[state=active]:bg-white/10">30D</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs px-3 data-[state=active]:bg-white/10">90D</TabsTrigger>
                <TabsTrigger value="1y" className="text-xs px-3 data-[state=active]:bg-white/10">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        <div className="p-4 h-[400px]">
          {view === 'chart' ? (
            isLoadingHistory ? (
              <div className="w-full h-full flex items-center justify-center text-white/20">Loading chart...</div>
            ) : history ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : null
          ) : (
            <div className="w-full h-full flex items-center justify-center gap-12">
               <ResponsiveContainer width="50%" height="100%">
                 <PieChart>
                   <Pie
                     data={holdings?.filter(h => h.value > 0).sort((a,b) => b.value - a.value).slice(0,6)}
                     cx="50%"
                     cy="50%"
                     innerRadius={80}
                     outerRadius={120}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {holdings?.filter(h => h.value > 0).sort((a,b) => b.value - a.value).slice(0,6).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()}`, props.payload.symbol]}
                     contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
               <div className="flex-1 flex flex-col gap-3 justify-center max-w-xs">
                 {holdings?.filter(h => h.value > 0).sort((a,b) => b.value - a.value).slice(0,6).map((token, index) => (
                   <div key={token.symbol} className="flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="font-bold">{token.symbol}</span>
                     </div>
                     <div className="text-white/60 font-mono">{token.allocation.toFixed(1)}%</div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Assets</CardTitle>
        </CardHeader>
        <div className="p-0 overflow-x-auto">
          {isLoadingHoldings ? (
             <div className="p-4 space-y-4">
               {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />)}
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-black/20 text-white/40 border-y border-white/5">
                <tr>
                  <th className="py-3 px-6 font-medium">Asset</th>
                  <th className="py-3 px-6 font-medium">Price</th>
                  <th className="py-3 px-6 font-medium">Balance</th>
                  <th className="py-3 px-6 font-medium">Value</th>
                  <th className="py-3 px-6 font-medium">Avg Cost</th>
                  <th className="py-3 px-6 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holdings?.map((token) => (
                  <tr key={token.symbol} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold">{token.symbol}</div>
                          <div className="text-xs text-white/40">{token.network}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                    <td className="py-4 px-6 font-mono">{token.balance.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono font-bold">${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 font-mono text-white/60">${token.cost > 0 ? (token.cost / token.balance).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className={`font-mono font-bold ${token.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {token.pnl >= 0 ? '+' : '-'}${Math.abs(token.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs ${token.pnlPercent >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                        {token.pnlPercent >= 0 ? '+' : ''}{token.pnlPercent.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}