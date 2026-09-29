import { useState } from "react"
import { useGetAirdrops, useClaimAirdrop, useCheckEligibility, getGetAirdropsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, CheckCircle2, AlertCircle, Clock, ExternalLink, Sparkles } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"

export default function Airdrops() {
  const { address } = useWallet()
  const [activeTab, setActiveTab] = useState("active")
  const [checkAddress, setCheckAddress] = useState(address || "")

  const { data: airdrops, isLoading } = useGetAirdrops(
    { status: activeTab as any },
    { query: { queryKey: getGetAirdropsQueryKey({ status: activeTab as any }) } }
  )

  const claimMutation = useClaimAirdrop()
  const checkMutation = useCheckEligibility()

  const handleClaim = (id: number) => {
    claimMutation.mutate({ id })
  }

  const handleCheck = () => {
    if (!checkAddress) return
    checkMutation.mutate({
      data: { walletAddress: checkAddress }
    })
  }

  const eligibilityResults = checkMutation.data

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" /> Airdrop Center
          </h1>
          <p className="text-white/60 mt-1">Discover, verify, and claim your free tokens.</p>
        </div>
      </div>

      {/* Eligibility Checker */}
      <Card className="glass-panel border-primary/20 bg-primary/5">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> Check Global Eligibility
              </h3>
              <p className="text-white/60 text-sm">Scan your wallet across all supported protocols to find unclaimed airdrops.</p>
            </div>
            <div className="flex-1 w-full flex gap-3">
              <Input 
                placeholder="Enter wallet address (0x...)" 
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
                className="h-12 bg-black/40 border-primary/20 font-mono"
              />
              <Button 
                size="lg" 
                className="h-12 shrink-0 bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                onClick={handleCheck}
                disabled={!checkAddress || checkMutation.isPending}
              >
                {checkMutation.isPending ? 'Checking...' : 'Check Wallet'}
              </Button>
            </div>
          </div>

          {eligibilityResults && eligibilityResults.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-4 space-y-3">
              {eligibilityResults.map((result) =>
                result.eligible ? (
                  <div key={result.airdropId} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-400">Eligible for {result.airdropName}!</h4>
                        <p className="text-sm text-green-200/70">{result.reason}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-right">
                      <div className="text-2xl font-bold font-mono text-white">{result.amount ?? 0} TOKENS</div>
                      <WalletGateButton size="sm" className="mt-2 bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto" action="claim this allocation">Claim Now</WalletGateButton>
                    </div>
                  </div>
                ) : (
                  <div key={result.airdropId} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white/80">{result.airdropName} — Not Eligible</h4>
                      <p className="text-sm text-white/40">{result.reason}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Airdrop List */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 border border-white/5 w-full justify-start h-12 p-1 overflow-x-auto hidden-scrollbar">
            <TabsTrigger value="active" className="px-6 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Active</TabsTrigger>
            <TabsTrigger value="upcoming" className="px-6 data-[state=active]:bg-white/10">Upcoming</TabsTrigger>
            <TabsTrigger value="claimed" className="px-6 data-[state=active]:bg-white/10">Claimed</TabsTrigger>
            <TabsTrigger value="all" className="px-6 data-[state=active]:bg-white/10">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        ) : !airdrops || airdrops.length === 0 ? (
          <div className="text-center py-20 bg-black/20 border border-white/5 rounded-2xl">
            <Gift className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60">No airdrops found in this category.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airdrops.map((airdrop) => (
              <Card key={airdrop.id} className="glass-panel border-white/5 hover:border-primary/30 transition-all group overflow-hidden flex flex-col">
                <CardHeader className="pb-4 relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] pointer-events-none rounded-full ${
                    airdrop.status === 'active' ? 'bg-primary/20' : 
                    airdrop.status === 'upcoming' ? 'bg-secondary/20' : 'bg-white/5'
                  }`} />
                  <div className="flex justify-between items-start relative z-10">
                    <img src={airdrop.logoUrl} alt={airdrop.name} className="w-12 h-12 rounded-xl bg-white/5 p-1 border border-white/10" />
                    <Badge variant={
                      airdrop.status === 'active' ? 'default' : 
                      airdrop.status === 'claimed' ? 'success' : 
                      airdrop.status === 'upcoming' ? 'secondary' : 'outline'
                    } className="uppercase text-[10px]">
                      {airdrop.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4 relative z-10">{airdrop.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-white/60 relative z-10">
                    <Badge variant="outline" className="bg-black/40 border-white/10 font-mono text-xs">{airdrop.network}</Badge>
                    <span>{airdrop.token}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-white/60 line-clamp-2 mb-4">{airdrop.description}</p>
                  
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-xs text-white/40 mb-1">Potential Allocation</div>
                    <div className="font-mono text-lg font-bold text-white">{airdrop.amount.toLocaleString()} {airdrop.token}</div>
                    {airdrop.amountUsd && (
                      <div className="text-xs text-green-400 font-mono">~${airdrop.amountUsd.toFixed(2)}</div>
                    )}
                  </div>

                  {airdrop.requirements && airdrop.requirements.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-white/40">Requirements:</div>
                      {airdrop.requirements.slice(0,2).map((req, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          {req}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex flex-col gap-3">
                  <div className="w-full flex items-center justify-between text-xs text-white/40 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ends</div>
                    <span>{(() => {
                      const days = Math.ceil((new Date(airdrop.endDate).getTime() - Date.now()) / 86400000)
                      return days > 0 ? `in ${days} day${days !== 1 ? 's' : ''}` : days === 0 ? 'Today' : 'Ended'
                    })()}</span>
                  </div>
                  
                  <WalletGateButton 
                    className={`w-full font-bold ${
                      airdrop.status === 'active' ? 'bg-primary hover:bg-primary/90 text-white' : 
                      'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                    }`}
                    disabled={airdrop.status !== 'active' || claimMutation.isPending}
                    onClick={() => handleClaim(airdrop.id)}
                    action="claim this airdrop"
                  >
                    {claimMutation.isPending && claimMutation.variables?.id === airdrop.id ? 'Claiming...' : 
                     airdrop.status === 'active' ? 'Claim Allocation' : 
                     airdrop.status === 'claimed' ? 'Already Claimed' : 'Not Yet Available'}
                  </WalletGateButton>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}