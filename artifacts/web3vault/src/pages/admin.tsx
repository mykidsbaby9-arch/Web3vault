import { useState } from "react"
import { formatDemoAge, seededDemoAge } from "@/lib/demo-time"
import { 
  useGetAdminStats, 
  useGetAdminUsers, 
  useGetAdminActivity, 
  useGetAnnouncements, 
  useCreateAnnouncement,
  getGetAdminStatsQueryKey,
  getGetAdminUsersQueryKey,
  getGetAdminActivityQueryKey,
  getGetAnnouncementsQueryKey
} from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Activity, DollarSign, Megaphone, Plus, Search, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"

export default function Admin() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("overview")
  
  const { data: stats, isLoading: isLoadingStats } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  })
  
  const { data: users, isLoading: isLoadingUsers } = useGetAdminUsers(
    { page: 1, limit: 10 },
    { query: { queryKey: getGetAdminUsersQueryKey({ page: 1, limit: 10 }) } }
  )
  
  const { data: activity, isLoading: isLoadingActivity } = useGetAdminActivity({
    query: { queryKey: getGetAdminActivityQueryKey() }
  })
  
  const { data: announcements, isLoading: isLoadingAnnouncements } = useGetAnnouncements({
    query: { queryKey: getGetAnnouncementsQueryKey() }
  })

  // Announcement Form State
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)
  const [announceTitle, setAnnounceTitle] = useState("")
  const [announceContent, setAnnounceContent] = useState("")
  const [announceType, setAnnounceType] = useState<"info"|"warning"|"success"|"promo">("info")
  const createAnnouncement = useCreateAnnouncement()

  const handleCreateAnnouncement = () => {
    createAnnouncement.mutate({
      data: {
        title: announceTitle,
        content: announceContent,
        type: announceType,
      }
    }, {
      onSuccess: () => {
        setIsAnnouncementOpen(false)
        setAnnounceTitle("")
        setAnnounceContent("")
        queryClient.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() })
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-secondary" /> System Admin
          </h1>
          <p className="text-white/60 mt-1">Platform management and analytics.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/40 border border-white/5 h-12 p-1">
          <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-white/10">Overview</TabsTrigger>
          <TabsTrigger value="users" className="px-6 data-[state=active]:bg-white/10">Users</TabsTrigger>
          <TabsTrigger value="announcements" className="px-6 data-[state=active]:bg-white/10">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Top KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-white/40 text-sm uppercase">Total Users</div>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                {isLoadingStats ? <Skeleton className="h-8 w-24 bg-white/10" /> : (
                  <div className="text-3xl font-bold font-mono">{stats?.totalUsers.toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-white/40 text-sm uppercase">DAU</div>
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                {isLoadingStats ? <Skeleton className="h-8 w-24 bg-white/10" /> : (
                  <div className="text-3xl font-bold font-mono text-green-400">{stats?.dailyActiveUsers.toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-white/40 text-sm uppercase">24h Volume</div>
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                </div>
                {isLoadingStats ? <Skeleton className="h-8 w-32 bg-white/10" /> : (
                  <div className="text-3xl font-bold font-mono text-yellow-400">${(stats?.tradingVolume24h || 0).toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-white/40 text-sm uppercase">Total Revenue</div>
                  <DollarSign className="w-4 h-4 text-secondary" />
                </div>
                {isLoadingStats ? <Skeleton className="h-8 w-32 bg-white/10" /> : (
                  <div className="text-3xl font-bold font-mono text-secondary">${(stats?.revenueStats.totalRevenue || 0).toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Chart */}
            <Card className="glass-panel border-white/5 lg:col-span-2">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {isLoadingStats ? (
                    <div className="w-full h-full flex items-center justify-center">Loading chart...</div>
                  ) : stats?.growthStats ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.growthStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric'})} stroke="rgba(255,255,255,0.2)" />
                        <YAxis stroke="rgba(255,255,255,0.2)" />
                        <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Network Usage */}
            <Card className="glass-panel border-white/5">
              <CardHeader>
                <CardTitle>Network Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingStats ? (
                    <Skeleton className="h-48 w-full bg-white/5" />
                  ) : stats?.networkUsage.map((net) => (
                    <div key={net.network} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-white/80">{net.network}</span>
                        <span className="font-mono text-white/60">{net.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${net.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Platform Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-2">
                  {Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  {activity?.slice(0, 8).map(event => (
                    <div key={event.id} className="flex justify-between items-center p-3 hover:bg-white/[0.02] rounded-lg transition-colors text-sm border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="font-bold text-white/80">{event.type}</span>
                        <span className="text-white/60">{event.description}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-black/40 font-mono text-[10px]">{event.network}</Badge>
                        <span className="text-xs text-white/40" data-testid={`text-demo-activity-time-${event.id}`}>{formatDemoAge(event.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card className="glass-panel border-white/5">
            <div className="p-4 border-b border-white/5 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input placeholder="Search users by address or username..." className="pl-9 bg-black/40 border-white/10" />
              </div>
            </div>
            <div className="overflow-x-auto">
              {isLoadingUsers ? (
                <div className="p-4 space-y-2">
                  {Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-14 w-full bg-white/5" />)}
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#0B1220]/90 text-white/40 border-b border-white/5">
                    <tr>
                      <th className="py-3 px-6 font-medium">User</th>
                      <th className="py-3 px-6 font-medium">Joined</th>
                      <th className="py-3 px-6 font-medium">Last Active</th>
                      <th className="py-3 px-6 font-medium text-right">Trades</th>
                      <th className="py-3 px-6 font-medium text-right">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users?.items.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02]">
                        <td className="py-4 px-6">
                          <div className="font-bold">{user.username || 'Unnamed'}</div>
                          <div className="text-xs text-white/40 font-mono">{user.address}</div>
                        </td>
                        <td className="py-4 px-6 text-white/60">{new Date(user.joinedAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-white/60">{new Date(user.lastActive).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right font-mono">{user.totalTrades.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right">
                          <Badge variant="outline" className={`bg-white/5 ${user.isActive ? 'border-green-500/30 text-green-400' : 'border-white/10 text-white/40'}`}>
                            {user.tier}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <Plus className="w-4 h-4" /> New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#0B1220] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Title</label>
                    <Input 
                      value={announceTitle} 
                      onChange={e => setAnnounceTitle(e.target.value)} 
                      className="bg-black/40 border-white/10" 
                      placeholder="Maintenance window..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Type</label>
                    <select 
                      value={announceType}
                      onChange={e => setAnnounceType(e.target.value as any)}
                      className="w-full h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="promo">Promo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Message</label>
                    <textarea 
                      value={announceContent}
                      onChange={e => setAnnounceContent(e.target.value)}
                      className="w-full min-h-[100px] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter announcement details..."
                    />
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={handleCreateAnnouncement}
                    disabled={!announceTitle || !announceContent || createAnnouncement.isPending}
                  >
                    {createAnnouncement.isPending ? 'Publishing...' : 'Publish Announcement'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingAnnouncements ? (
              Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl bg-white/5" />)
            ) : announcements?.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-white/40">No active announcements</div>
            ) : (
              announcements?.map(ann => (
                <Card key={ann.id} className="glass-panel border-white/5">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant={
                        ann.type === 'warning' ? 'destructive' : 
                        ann.type === 'success' ? 'success' : 
                        ann.type === 'promo' ? 'secondary' : 'default'
                      } className="uppercase text-[10px]">{ann.type}</Badge>
                      <span className="text-xs text-white/40">
                        {seededDemoAge("announcements", ann.id, ann.createdAt) ?? new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{ann.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/60">{ann.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}