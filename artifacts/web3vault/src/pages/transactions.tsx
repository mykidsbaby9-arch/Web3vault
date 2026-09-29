import { seededDemoAge } from "@/lib/demo-time"
import { useState } from "react"
import { useGetTransactions, getGetTransactionsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { History, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Network, ShieldCheck, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Transactions() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [network, setNetwork] = useState("all")
  const [type, setType] = useState("all")

  const { data: txData, isLoading } = useGetTransactions(
    { 
      page, 
      limit: 15, 
      search: search || undefined, 
      network: network !== "all" ? network : undefined,
      type: type !== "all" ? type : undefined
    },
    { 
      query: { 
        queryKey: getGetTransactionsQueryKey({ 
          page, limit: 15, search: search || undefined, network: network !== "all" ? network : undefined, type: type !== "all" ? type : undefined 
        }),
        placeholderData: (prev: any) => prev
      } 
    }
  )

  const getTxIcon = (type: string) => {
    switch(type) {
      case 'receive': return <ArrowDownRight className="w-4 h-4 text-green-400" />
      case 'send': return <ArrowUpRight className="w-4 h-4 text-red-400" />
      case 'swap': return <RefreshCw className="w-4 h-4 text-primary" />
      case 'bridge': return <Network className="w-4 h-4 text-secondary" />
      case 'approve': return <ShieldCheck className="w-4 h-4 text-yellow-400" />
      default: return <History className="w-4 h-4 text-white/60" />
    }
  }

  const getTxColor = (type: string) => {
    switch(type) {
      case 'receive': return 'bg-green-500/10 border-green-500/20 text-green-400'
      case 'send': return 'bg-red-500/10 border-red-500/20 text-red-400'
      case 'swap': return 'bg-primary/10 border-primary/20 text-primary'
      case 'bridge': return 'bg-secondary/10 border-secondary/20 text-secondary'
      case 'approve': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      default: return 'bg-white/5 border-white/10 text-white/60'
    }
  }

  const formatHash = (hash: string) => `${hash.slice(0,6)}...${hash.slice(-4)}`

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-white/60 mt-1">A complete record of all your on-chain activity.</p>
        </div>
        <Button variant="outline" className="glass-card gap-2 text-white/80 border-white/10 hover:bg-white/10">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card className="glass-panel flex-1 flex flex-col overflow-hidden border-white/5 min-h-0">
        {/* Filters */}
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 shrink-0 bg-black/20">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Search by hash..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-black/40 border-white/10"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              className="h-9 rounded-md border border-white/10 bg-black/40 px-3 py-1 text-sm text-white/80 focus:outline-none"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            >
              <option value="all">All Networks</option>
              <option value="ethereum">Ethereum</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
              <option value="polygon">Polygon</option>
            </select>
            
            <select 
              className="h-9 rounded-md border border-white/10 bg-black/40 px-3 py-1 text-sm text-white/80 focus:outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="send">Send</option>
              <option value="receive">Receive</option>
              <option value="swap">Swap</option>
              <option value="bridge">Bridge</option>
              <option value="approve">Approve</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
             <div className="p-4 space-y-2">
               {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg" />)}
             </div>
          ) : !txData || txData.items.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-white/40">
               <History className="w-12 h-12 mb-4 opacity-20" />
               <p>No transactions found matching your criteria.</p>
             </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0B1220]/90 backdrop-blur-md text-white/40 sticky top-0 z-10 shadow-sm border-b border-white/5">
                <tr>
                  <th className="py-3 px-6 font-medium font-mono text-xs uppercase tracking-wider">Transaction</th>
                  <th className="py-3 px-6 font-medium font-mono text-xs uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-6 font-medium font-mono text-xs uppercase tracking-wider hidden md:table-cell">Network</th>
                  <th className="py-3 px-6 font-medium font-mono text-xs uppercase tracking-wider hidden lg:table-cell">Gas Fee</th>
                  <th className="py-3 px-6 font-medium font-mono text-xs uppercase tracking-wider text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {txData.items.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getTxColor(tx.type)}`}>
                          {getTxIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-bold capitalize">{tx.type}</div>
                          <div className="text-xs text-primary font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                            {formatHash(tx.hash)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {tx.amount > 0 ? (
                        <>
                          <div className="font-mono font-bold text-white/90">
                            {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}
                            {tx.amount} {tx.token}
                          </div>
                          {tx.amountUsd && (
                            <div className="text-xs font-mono text-white/40">${tx.amountUsd.toFixed(2)}</div>
                          )}
                        </>
                      ) : (
                         <div className="text-white/40 font-mono">-</div>
                      )}
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <Badge variant="outline" className="bg-black/40 border-white/10 font-normal">{tx.network}</Badge>
                    </td>
                    <td className="py-4 px-6 hidden lg:table-cell">
                      <div className="font-mono text-xs text-white/60">
                        {tx.gasFee.toFixed(6)} ETH
                        {tx.gasFeeUsd && <span className="ml-1 text-white/30">(${tx.gasFeeUsd.toFixed(2)})</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {seededDemoAge("transactions", tx.id, tx.timestamp) ? (
                        <div className="text-sm">{seededDemoAge("transactions", tx.id, tx.timestamp)}</div>
                      ) : (
                        <>
                          <div className="text-sm">{new Date(tx.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-white/40">{new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {txData && txData.total > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20 shrink-0">
            <div className="text-sm text-white/40">
              Showing <span className="text-white">{((page - 1) * 15) + 1}</span> to <span className="text-white">{Math.min(page * 15, txData.total)}</span> of <span className="text-white">{txData.total}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/40 border-white/10 hover:bg-white/10"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/40 border-white/10 hover:bg-white/10"
                disabled={page * 15 >= txData.total}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}