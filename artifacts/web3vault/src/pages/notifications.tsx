import { seededDemoAge } from "@/lib/demo-time"
import { useState } from "react"
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getGetNotificationsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, ArrowUpRight, ArrowDownRight, ShieldAlert, Trophy, Gift, Activity, Info, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"

export default function Notifications() {
  const queryClient = useQueryClient()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const { data: notifications, isLoading } = useGetNotifications(
    { unread: showUnreadOnly ? true : undefined },
    { query: { queryKey: getGetNotificationsQueryKey({ unread: showUnreadOnly ? true : undefined }) } }
  )

  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
    })
  }

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <Activity className="w-5 h-5 text-blue-400" />
      case 'security': return <ShieldAlert className="w-5 h-5 text-red-400" />
      case 'reward': return <Trophy className="w-5 h-5 text-yellow-400" />
      case 'airdrop': return <Gift className="w-5 h-5 text-purple-400" />
      case 'trading': return <Activity className="w-5 h-5 text-green-400" />
      default: return <Info className="w-5 h-5 text-white/60" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'bg-blue-500/10 border-blue-500/20'
      case 'security': return 'bg-red-500/10 border-red-500/20'
      case 'reward': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'airdrop': return 'bg-purple-500/10 border-purple-500/20'
      case 'trading': return 'bg-green-500/10 border-green-500/20'
      default: return 'bg-white/5 border-white/10'
    }
  }

  const hasUnread = notifications?.some(n => !n.isRead)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" /> Notifications
          </h1>
          <p className="text-white/60 mt-1">Stay updated on your portfolio and security alerts.</p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Switch 
              id="unread-only" 
              checked={showUnreadOnly} 
              onCheckedChange={setShowUnreadOnly} 
            />
            <Label htmlFor="unread-only" className="text-white/60 cursor-pointer">Unread only</Label>
          </div>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:bg-primary/10 hover:text-primary"
            onClick={handleMarkAllRead}
            disabled={!hasUnread || markAllRead.isPending}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-white/5">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : !notifications || notifications.length === 0 ? (
             <div className="p-16 text-center text-white/40 flex flex-col items-center">
               <Bell className="w-12 h-12 mb-4 opacity-20" />
               <p>You're all caught up!</p>
             </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 flex gap-4 transition-colors cursor-pointer relative overflow-hidden group ${
                    notif.isRead ? 'opacity-60 hover:opacity-100 hover:bg-white/[0.02]' : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border ${getColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-base font-bold truncate ${!notif.isRead ? 'text-white' : 'text-white/80'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-white/40 shrink-0 ml-4 font-mono">
                        {seededDemoAge("notifications", notif.id, notif.createdAt)
                          ?? `${new Date(notif.createdAt).toLocaleDateString()} ${new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                      </span>
                    </div>
                    <p className={`text-sm ${!notif.isRead ? 'text-white/80' : 'text-white/60'}`}>
                      {notif.message}
                    </p>
                    {notif.link && (
                      <div className="mt-2 text-xs text-primary font-medium hover:underline">
                        View details
                      </div>
                    )}
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}