import { useState, useEffect } from "react"
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { User, Copy, CheckCircle2, ShieldCheck, Trophy, Mail, Hash, Globe } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"

export default function Profile() {
  const { address } = useWallet()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() }
  })

  const updateProfile = useUpdateProfile()

  // Form State
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setEmail(profile.email || "")
      setBio(profile.bio || "")
      setNotificationsEnabled(profile.notificationsEnabled)
    }
  }, [profile])

  const copyAddress = () => {
    if (!profile?.address) return
    navigator.clipboard.writeText(profile.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    updateProfile.mutate({
      data: {
        username,
        email,
        bio,
        notificationsEnabled
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() })
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-primary" /> Profile Settings
          </h1>
          <p className="text-white/60 mt-1">Manage your identity and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Identity Card */}
          <Card className="glass-panel border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
            <CardContent className="pt-8 relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-black/40 border-4 border-[#0B1220] shadow-xl flex items-center justify-center mb-4 relative z-10 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white/40" />
                )}
              </div>
              <h2 className="text-xl font-bold">{profile?.username || "Unnamed User"}</h2>
              <div className="flex items-center gap-2 mt-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-sm font-mono text-white/80">
                  {profile?.address ? `${profile.address.slice(0,6)}...${profile.address.slice(-4)}` : "Not connected"}
                </span>
                <button onClick={copyAddress} className="text-white/40 hover:text-white transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="w-full h-px bg-white/5 my-6" />
              
              <div className="w-full flex justify-between items-center text-sm">
                <span className="text-white/40">Joined</span>
                <span className="font-medium text-white/80">
                  {profile ? new Date(profile.joinedAt).toLocaleDateString() : "..."}
                </span>
              </div>
              <div className="w-full flex justify-between items-center text-sm mt-3">
                <span className="text-white/40">Tier</span>
                <Badge variant="outline" className="border-yellow-400/20 text-yellow-400 bg-yellow-400/10">
                  {profile?.tier || "Bronze"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card className="glass-panel border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                 <div className="text-sm text-white/40 mb-1">Security Score</div>
                 <div className="text-xl font-bold font-mono">{profile?.securityScore || 0}/100</div>
               </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20 text-yellow-400">
                 <Trophy className="w-6 h-6" />
               </div>
               <div>
                 <div className="text-sm text-white/40 mb-1">Reward Points</div>
                 <div className="text-xl font-bold font-mono text-yellow-400">{(profile?.rewardPoints || 0).toLocaleString()}</div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white/60">Username</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input 
                      id="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9 bg-black/40 border-white/10" 
                      placeholder="Enter a username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/60">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-black/40 border-white/10" 
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white/60">Bio</Label>
                  <textarea 
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="space-y-4">
                <h3 className="text-lg font-bold">Preferences</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="space-y-1">
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-white/40">Receive alerts for transactions and airdrops</div>
                  </div>
                  <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}