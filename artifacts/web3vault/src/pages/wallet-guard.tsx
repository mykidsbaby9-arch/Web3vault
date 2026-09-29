import { useState } from "react"
import { useScanWallet, useGetApprovals, useRevokeApproval, getGetApprovalsQueryKey } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, CheckCircle, Search, ExternalLink } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"

export default function WalletGuard() {
  const { address: connectedAddress } = useWallet()
  const [scanAddress, setScanAddress] = useState(connectedAddress || "")
  
  const scanMutation = useScanWallet()
  const revokeMutation = useRevokeApproval()

  const { data: approvals, isLoading: isLoadingApprovals, refetch: refetchApprovals } = useGetApprovals(
    { address: scanAddress },
    { query: { enabled: !!scanAddress, queryKey: getGetApprovalsQueryKey({ address: scanAddress }) } }
  )

  const handleScan = () => {
    if (!scanAddress) return
    scanMutation.mutate({
      data: {
        address: scanAddress,
        network: "ethereum"
      }
    })
    refetchApprovals()
  }

  const handleRevoke = (id: number) => {
    if (!connectedAddress) return
    revokeMutation.mutate({
      data: {
        approvalId: id,
        walletAddress: connectedAddress
      }
    }, {
      onSuccess: () => refetchApprovals()
    })
  }

  const scanResult = scanMutation.data

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" /> Wallet Guard
          </h1>
          <p className="text-white/60 mt-1">Proactive security scanning and risk management.</p>
        </div>
      </div>

      {/* Scanner Input */}
      <Card className="glass-panel border-red-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input 
                value={scanAddress}
                onChange={(e) => setScanAddress(e.target.value)}
                placeholder="Enter wallet address to scan..."
                className="pl-10 h-12 text-lg bg-black/40 border-white/10 font-mono text-white"
              />
            </div>
            <WalletGateButton 
              size="lg" 
              className="h-12 px-8 bg-red-500 hover:bg-red-600 text-white font-bold"
              onClick={handleScan}
              disabled={!scanAddress || scanMutation.isPending}
              action="scan this wallet"
            >
              {scanMutation.isPending ? 'Scanning...' : 'Scan Address'}
            </WalletGateButton>
          </div>
        </CardContent>
      </Card>

      {scanResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="glass-panel md:col-span-1 border-white/5 relative overflow-hidden flex flex-col items-center justify-center p-8">
             <div className={`absolute top-0 right-0 p-32 blur-[100px] pointer-events-none rounded-full ${
               scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high' ? 'bg-red-500/10' : 
               scanResult.riskLevel === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
             }`} />
             
             <div className="relative w-48 h-48 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" 
                    stroke={
                      scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high' ? '#ef4444' : 
                      scanResult.riskLevel === 'medium' ? '#eab308' : '#10b981'
                    } 
                    strokeWidth="8" 
                    strokeDasharray={`${(100 - scanResult.riskScore) * 2.51} 251.2`} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-bold font-mono">{100 - scanResult.riskScore}</span>
                 <span className="text-xs text-white/40 uppercase tracking-widest mt-1">Health Score</span>
               </div>
             </div>
             <Badge className="mt-4 uppercase tracking-widest font-bold" variant={
               scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high' ? 'destructive' : 
               scanResult.riskLevel === 'medium' ? 'warning' : 'success'
             }>
               {scanResult.riskLevel} Risk
             </Badge>
          </Card>

          {/* Threats & Recommendations */}
          <Card className="glass-panel md:col-span-2 border-white/5">
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Active Threats ({scanResult.threats.length})
                </h4>
                {scanResult.threats.length === 0 ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>No active threats detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scanResult.threats.map((threat, i) => (
                      <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-100">{threat.type}</div>
                          <div className="text-sm text-red-200/70">{threat.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> Recommendations
                </h4>
                <ul className="space-y-2">
                  {scanResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 items-start text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="text-white/80">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approvals Manager */}
      <Card className="glass-panel border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Token Approvals</CardTitle>
            <CardDescription className="text-white/50">Manage smart contracts authorized to spend your tokens.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-white/5">Ethereum</Badge>
        </CardHeader>
        <CardContent>
          {isLoadingApprovals ? (
            <div className="space-y-3">
              {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : !approvals || approvals.length === 0 ? (
             <div className="text-center py-12 text-white/40 bg-black/20 rounded-xl border border-white/5">
                No active token approvals found.
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-white/40 border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-medium px-4">Token</th>
                    <th className="pb-3 font-medium px-4">Authorized Spender</th>
                    <th className="pb-3 font-medium px-4">Allowance</th>
                    <th className="pb-3 font-medium px-4">Risk Level</th>
                    <th className="pb-3 font-medium px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold">{approval.tokenSymbol || approval.token.slice(0,8)}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{approval.spenderName}</div>
                        <div className="text-xs text-white/40 font-mono flex items-center gap-1">
                          {approval.spender.slice(0,8)}...{approval.spender.slice(-6)}
                          <ExternalLink className="w-3 h-3 hover:text-primary cursor-pointer" />
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-white/80">
                        {approval.isUnlimited ? 'Unlimited' : approval.allowance}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={
                          approval.riskLevel === 'danger' ? 'destructive' : 
                          approval.riskLevel === 'caution' ? 'warning' : 'success'
                        } className="uppercase text-[10px]">
                          {approval.riskLevel || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <WalletGateButton 
                          variant="outline" 
                          size="sm" 
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
                          onClick={() => handleRevoke(approval.id)}
                          disabled={revokeMutation.isPending && revokeMutation.variables?.data.approvalId === approval.id}
                          action="revoke approval"
                        >
                          {revokeMutation.isPending && revokeMutation.variables?.data.approvalId === approval.id ? 'Revoking...' : 'Revoke'}
                        </WalletGateButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}