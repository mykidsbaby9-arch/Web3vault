import { Link, useLocation } from "wouter"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { useAppKit, useDisconnect } from "@reown/appkit/react"
import { LogOut, Bell, Shield, Wallet } from "lucide-react"

export function TopNav() {
  const { address, isConnected } = useWallet()
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
  const [location] = useLocation()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B1220]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Web3Vault</span>
          </Link>

          {isConnected && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium ml-4">
              {[
                ["Dashboard", "/dashboard"],
                ["Trade", "/trading"],
                ["Swap", "/swap"],
                ["Bridge", "/bridge"],
                ["Staking", "/staking"],
              ].map(([name, path]) => (
                <Link key={name} href={path} className={`transition-colors hover:text-white ${location === path ? "text-white" : "text-white/50"}`}>
                  {name}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Link href="/notifications" className="relative p-2 text-white/60 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-medium text-white/40">Ethereum Mainnet</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { void disconnect() }} className="text-white/50 hover:text-white hover:bg-white/5 h-8 w-8">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => open()}
              className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
