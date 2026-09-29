import { useState } from "react"
import { formatDemoAge, seededDemoAge } from "@/lib/demo-time"
import { useGetRewardsSummary, useClaimDailyReward, useGetRewardsHistory, useGetLeaderboard, useGetReferralInfo, getGetRewardsSummaryQueryKey, getGetRewardsHistoryQueryKey, getGetLeaderboardQueryKey, getGetReferralInfoQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Gift, Copy, CheckCircle2, Star, TrendingUp, Users, Crown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

export default function Rewards() {
  const [activeTab, setActiveTab] = useState("overview")
  const [copied, setCopied] = useState(false)

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useGetRewardsSummary({
    query: { queryKey: getGetRewardsSummaryQueryKey() }
  })
  const { data: history, isLoading: isLoadingHistory } = useGetRewardsHistory({
    query: { queryKey: getGetRewardsHistoryQueryKey() }
  })
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey() }
  })
  const { data: referralInfo, isLoading: isLoadingReferral } = useGetReferralInfo({
    query: { queryKey: getGetReferralInfoQueryKey() }
  })

  const claimDaily = useClaimDailyReward()

  const handleClaimDaily = () => {
    claimDaily.mutate(undefined, {
      onSuccess: () => refetchSummary()
    })
  }

  const copyReferralCode = () => {
    if (!referralInfo) return
    navigator.clipboard.writeText(referralInfo.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTierColor = (tier: string) => {
    switch(tier.toLowerCase()) {
      case 'bronze': return 'text-orange-400 border-orange-400/20 bg-orange-400/10'
      case 'silver': return 'text-slate-300 border-slate-300/20 bg-slate-300/10'
      case 'gold': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
      case 'platinum': return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10'
      case 'diamond': return 'text-purple-400 border-purple-400/20 bg-purple-400/10'
      default: return 'text-primary border-primary/20 bg-primary/10'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" /> Vault Rewards
          </h1>
          <p className="text-white/60 mt-1">Earn points by trading, staking, and exploring Web3Vault.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-white/5 h-12 p-1">
          <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-white/10">Overview</TabsTrigger>
          <TabsTrigger value="quests" className="px-6 data-[state=active]:bg-white/10">Quests & Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" className="px-6 data-[state=active]:bg-white/10">Leaderboard</TabsTrigger>
          <TabsTrigger value="referrals" className="px-6 data-[state=active]:bg-white/10">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Stats Card */}
            <Card className="glass-panel md:col-span-2 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-yellow-400/5 blur-[100px] pointer-events-none rounded-full" />
              <CardContent className="p-8">
                {isLoadingSummary ? (
                   <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
                ) : summary ? (
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-white/60 text-sm font-medium uppercase tracking-widest">Total Points</span>
                        <div className="text-5xl font-bold font-mono mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                          {summary.totalPoints.toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold uppercase tracking-widest text-sm ${getTierColor(summary.tier)}`}>
                        <Crown className="w-4 h-4" /> {summary.tier}
                      </div>
                    </div>
                    
                    <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Progress to {summary.tier === 'diamond' ? 'Max' : 'Next Tier'}</span>
                        <span className="font-mono text-white/80">{summary.tierProgress}%</span>
                      </div>
                      <Progress value={summary.tierProgress} className="h-2 bg-white/10" />
                      {summary.nextTierPoints && (
                        <p className="text-xs text-white/40 text-right">{summary.nextTierPoints.toLocaleString()} pts to next rank</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                       <div>
                         <div className="text-white/40 text-xs mb-1 uppercase">Trading</div>
                         <div className="font-mono font-bold text-lg">{summary.tradingRewards.toLocaleString()}</div>
                       </div>
                       <div>
                         <div className="text-white/40 text-xs mb-1 uppercase">Staking</div>
                         <div className="font-mono font-bold text-lg">{summary.stakingRewards.toLocaleString()}</div>
                       </div>
                       <div>
                         <div className="text-white/40 text-xs mb-1 uppercase">Referrals</div>
                         <div className="font-mono font-bold text-lg">{summary.referralCount}</div>
                       </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card className="glass-panel border-white/5 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> Daily Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {isLoadingSummary ? (
                   <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
                ) : summary ? (
                  <>
                    <div className="w-24 h-24 rounded-full border-4 border-orange-500/30 flex flex-col items-center justify-center mb-6 relative">
                      <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse" />
                      <Flame className={`w-8 h-8 ${summary.dailyClaimedToday ? 'text-orange-500' : 'text-white/40'}`} />
                      <span className="font-bold text-xl mt-1">{summary.dailyStreakDays}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{summary.dailyStreakDays} Day Streak</h3>
                    <p className="text-sm text-white/50 mb-6">Come back tomorrow to increase your multiplier!</p>
                    <WalletGateButton 
                      className={`w-full h-12 text-lg font-bold ${summary.dailyClaimedToday ? 'bg-white/10 text-white/40 cursor-not-allowed border-none' : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'}`}
                      disabled={summary.dailyClaimedToday || claimDaily.isPending}
                      onClick={handleClaimDaily}
                      action="claim daily points"
                    >
                      {claimDaily.isPending ? 'Claiming...' : summary.dailyClaimedToday ? 'Claimed Today' : 'Claim Points'}
                    </WalletGateButton>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Recent History */}
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Recent Points History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-2">
                  {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
                </div>
              ) : history?.length === 0 ? (
                <div className="text-center py-8 text-white/40">No points earned yet. Start trading!</div>
              ) : (
                <div className="space-y-2">
                  {history?.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          {event.type === 'daily' ? <Flame className="w-4 h-4 text-orange-400" /> :
                           event.type === 'trade' ? <TrendingUp className="w-4 h-4 text-primary" /> :
                           event.type === 'referral' ? <Users className="w-4 h-4 text-green-400" /> :
                           <Star className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm capitalize">{event.type}</div>
                          <div className="text-xs text-white/40">{event.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-400 font-mono">+{event.points}</div>
                        <div className="text-xs text-white/40">
                          {seededDemoAge("rewards", event.id, event.createdAt) ?? new Date(event.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {isLoadingSummary ? (
               Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-xl" />)
             ) : summary?.badges.map((badge) => (
                <Card key={badge.id} className={`glass-panel border-white/5 overflow-hidden transition-all ${badge.isEarned ? 'border-yellow-400/30 bg-yellow-400/5' : 'opacity-60 grayscale'}`}>
                  <CardContent className="p-6 flex flex-col items-center text-center h-full">
                     <div className="text-4xl mb-4">{badge.icon}</div>
                     <h4 className="font-bold text-sm mb-2">{badge.name}</h4>
                     <p className="text-xs text-white/60 mb-4 flex-1">{badge.description}</p>
                     {badge.isEarned ? (
                         <Badge variant="success" className="w-full justify-center">Earned {formatDemoAge(badge.earnedAt!)}</Badge>
                     ) : (
                        <Badge variant="outline" className="w-full justify-center bg-black/40">Locked</Badge>
                     )}
                  </CardContent>
                </Card>
             ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                 <div className="space-y-2">
                   {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-white/5" />)}
                 </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-white/40 border-b border-white/10">
                    <tr>
                      <th className="pb-3 px-4 w-16">Rank</th>
                      <th className="pb-3 px-4">User</th>
                      <th className="pb-3 px-4">Tier</th>
                      <th className="pb-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard?.map((entry) => (
                      <tr key={entry.rank} className={`${entry.isCurrentUser ? 'bg-primary/10' : 'hover:bg-white/5'} transition-colors`}>
                        <td className="py-3 px-4 font-mono font-bold text-white/60">
                          {entry.rank === 1 ? <Crown className="w-5 h-5 text-yellow-400" /> : 
                           entry.rank === 2 ? <Crown className="w-5 h-5 text-slate-300" /> : 
                           entry.rank === 3 ? <Crown className="w-5 h-5 text-orange-400" /> : 
                           `#${entry.rank}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{entry.badge}</span>
                            <span className="font-mono text-white/80">{entry.address.slice(0,6)}...{entry.address.slice(-4)}</span>
                            {entry.isCurrentUser && <Badge className="ml-2 bg-primary/20 text-primary border-none h-5 px-1.5 text-[10px]">YOU</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`bg-transparent border-white/10 ${getTierColor(entry.tier).split(' ')[0]}`}>{entry.tier}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-yellow-400">
                          {entry.points.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="glass-panel border-primary/20 bg-primary/5">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Invite Friends</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 <p className="text-white/60 text-sm">Earn 10% of your friends' trading fees in points, plus a 5,000 points bonus when they make their first swap.</p>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/40 uppercase">Your Referral Code</label>
                   <div className="flex gap-2">
                     <Input 
                       readOnly 
                       value={isLoadingReferral ? '...' : referralInfo?.referralCode || ''} 
                       className="bg-black/40 border-primary/30 font-mono text-lg text-primary font-bold tracking-widest text-center"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-medium text-white/40 uppercase">Your Referral Link</label>
                   <div className="flex gap-2">
                     <Input 
                       readOnly 
                       value={isLoadingReferral ? '...' : referralInfo?.referralLink || ''} 
                       className="bg-black/40 border-white/10 text-white/60"
                     />
                     <Button 
                       variant="outline" 
                       className="shrink-0 bg-white/5 border-white/10 hover:bg-white/10 w-12 p-0"
                       onClick={copyReferralCode}
                     >
                       {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                     </Button>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="glass-panel border-white/5">
               <CardHeader>
                 <CardTitle>Referral Stats</CardTitle>
               </CardHeader>
               <CardContent>
                 {isLoadingReferral ? (
                    <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
                 ) : referralInfo ? (
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                       <div className="text-xs text-white/40 uppercase mb-1">Total Referrals</div>
                       <div className="text-3xl font-bold font-mono">{referralInfo.totalReferrals}</div>
                     </div>
                     <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                       <div className="text-xs text-white/40 uppercase mb-1">Pending</div>
                       <div className="text-3xl font-bold font-mono text-yellow-400">{referralInfo.pendingReferrals}</div>
                     </div>
                     <div className="bg-black/20 p-4 rounded-xl border border-white/5 col-span-2">
                       <div className="text-xs text-white/40 uppercase mb-1">Total Earned</div>
                       <div className="text-3xl font-bold font-mono text-primary">+{referralInfo.totalEarned.toLocaleString()} pts</div>
                     </div>
                   </div>
                 ) : null}
               </CardContent>
             </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}