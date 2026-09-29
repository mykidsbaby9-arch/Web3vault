import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { useAppKit } from "@reown/appkit/react"
import { Wallet, ShieldCheck, Lock } from "lucide-react"
import { motion } from "framer-motion"
import React from "react"

// ─── WalletGateButton ────────────────────────────────────────────────────────
interface WalletGateButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  action?: string
  children: React.ReactNode
  onClick?: () => void
}

export function WalletGateButton({ action = "proceed", children, onClick, disabled, className, ...props }: WalletGateButtonProps) {
  const { isConnected } = useWallet()
  const { open } = useAppKit()

  if (!isConnected) {
    if (disabled) {
      return <Button {...props} className={className} disabled>{children}</Button>
    }
    return (
      <Button {...props} className={`${className ?? ""} relative overflow-hidden group`} onClick={() => open()}>
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Connect Wallet to {action}
        </span>
      </Button>
    )
  }

  return <Button {...props} className={className} onClick={onClick} disabled={disabled}>{children}</Button>
}

// ─── WalletGateOverlay ───────────────────────────────────────────────────────
interface WalletGateOverlayProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function WalletGateOverlay({ children, title, description }: WalletGateOverlayProps) {
  const { isConnected } = useWallet()
  if (isConnected) return <>{children}</>
  return <WalletRequiredCard title={title} description={description} />
}

// ─── WalletRequiredCard ──────────────────────────────────────────────────────
export function WalletRequiredCard({ title = "Connect Wallet to Continue", description }: { title?: string; description?: string }) {
  const { open } = useAppKit()
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-5 py-14 px-8 text-center rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <div className="relative w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-white/55 max-w-xs leading-relaxed">
          {description ?? "You're viewing a demonstration. Connect your wallet to access all features and manage your real assets."}
        </p>
      </div>
      <Button
        size="lg"
        className="h-12 px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)] gap-2"
        onClick={() => open()}
      >
        <Wallet className="w-4 h-4" /> Connect Wallet
      </Button>
      <p className="text-xs text-white/30 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-green-500/70" />
        Safe &amp; Encrypted Web3 Access
      </p>
    </motion.div>
  )
}

// ─── DemoInterceptor ─────────────────────────────────────────────────────────
export function DemoInterceptor({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isConnected } = useWallet()
  const { open } = useAppKit()
  if (isConnected) return <div className={className}>{children}</div>
  return <div className={`${className ?? ""} cursor-pointer`} onClick={() => open()}>{children}</div>
}
