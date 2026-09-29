import { useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TopNav } from "@/components/shared/top-nav"
import { useGetMarketTickers, getGetMarketTickersQueryKey } from "@workspace/api-client-react"
import {
  ArrowRight, ShieldCheck, Zap, Globe, Coins, Layers, Activity,
  ShieldAlert, ArrowLeftRight, Network, Gift, Trophy, PieChart,
  Image as ImageIcon, BarChart2, Key, TrendingUp,
} from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useAppKit } from "@reown/appkit/react"

// The API also serves simulated quotes. Keep an explicitly labeled offline
// sample so the decorative ticker doesn't disappear when that service is down.
const SAMPLE_TICKERS = [
  { symbol: "BTC", price: 83145.31, changePercent24h: 1.87 },
  { symbol: "ETH", price: 2682.88, changePercent24h: -1.27 },
  { symbol: "BNB", price: 621.45, changePercent24h: 2.02 },
  { symbol: "SOL", price: 185.72, changePercent24h: 5.04 },
  { symbol: "MATIC", price: 0.8823, changePercent24h: -3.71 },
  { symbol: "AVAX", price: 41.23, changePercent24h: 4.56 },
  { symbol: "ARB", price: 1.24, changePercent24h: 5.98 },
  { symbol: "OP", price: 2.87, changePercent24h: 5.12 },
]

function TickerBar() {
  const { data: tickers, isError } = useGetMarketTickers({
    query: { queryKey: getGetMarketTickersQueryKey(), refetchInterval: 8000 }
  })
  const shownTickers = tickers?.length ? tickers : SAMPLE_TICKERS
  return (
    <div className="h-10 bg-black/40 border-b border-white/5 overflow-hidden flex items-center relative z-20">
      <span className="absolute left-0 z-10 h-full flex items-center bg-[#080d19] px-2 text-[9px] font-medium text-white/50 sm:px-3 sm:text-[10px]">
        {isError ? "· Updating failed" : "Updating..."}
      </span>
      <div className="flex animate-[marquee_35s_linear_infinite] whitespace-nowrap">
        {[...shownTickers, ...shownTickers, ...shownTickers].map((ticker, i) => (
          <div key={`${ticker.symbol}-${i}`} className="flex items-center gap-2 mx-6 text-sm">
            <span className="font-bold text-white/80">{ticker.symbol}</span>
            <span className="font-mono text-white">${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
            <span className={ticker.changePercent24h >= 0 ? "text-green-400" : "text-red-400"}>
              {ticker.changePercent24h >= 0 ? "+" : ""}{ticker.changePercent24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = []
    for (let i = 0; i < 55; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 2 + 0.5 })
    }
    let rafId: number
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
        ctx.fillStyle = "rgba(59,130,246,0.6)"
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const d = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (d < 140) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(59,130,246,${0.18 * (1 - d / 140)})`
            ctx.lineWidth = 1; ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke()
          }
        }
      })
      rafId = requestAnimationFrame(render)
    }
    render()
    const onResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight }
    window.addEventListener("resize", onResize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-35 z-0" />
}

const SERVICES = [
  { name: "WALLET GUARD", href: "/wallet-guard", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20 hover:border-red-500/50", glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]" },
  { name: "TOKEN SWAP", href: "/swap", icon: ArrowLeftRight, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50", glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
  { name: "CLAIM AIRDROP", href: "/airdrops", icon: Gift, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50", glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
  { name: "STAKING", href: "/staking", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/50", glow: "hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]" },
  { name: "BRIDGE", href: "/bridge", icon: Network, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50", glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]" },
  { name: "NFT VAULT", href: "/nfts", icon: ImageIcon, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50", glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]" },
  { name: "DEFI HUB", href: "/defi-hub", icon: Layers, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20 hover:border-teal-500/50", glow: "hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]" },
  { name: "ANALYTICS", href: "/analytics", icon: BarChart2, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50", glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]" },
  { name: "RECOVERY", href: "/recovery", icon: Key, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50", glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]" },
  { name: "REWARDS", href: "/rewards", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50", glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
  { name: "FREE TOKENS", href: "/free-tokens", icon: Coins, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20 hover:border-green-500/50", glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]" },
]

const FEATURES = [
  { icon: Activity, title: "Pro Trading Terminal", desc: "Live charts, market depth, and instant execution across multiple chains." },
  { icon: Layers, title: "Cross-Chain Bridge", desc: "Move assets seamlessly between 14+ networks with unified liquidity." },
  { icon: ShieldCheck, title: "Wallet Guard", desc: "AI-powered scanning for malicious contracts, phishing, and risky approvals." },
  { icon: Globe, title: "Airdrop Radar", desc: "Track eligibility and claim upcoming airdrops directly from one dashboard." },
  { icon: TrendingUp, title: "Staking & Yield", desc: "Earn passive income with vetted protocols offering up to 14.5% APY." },
  { icon: Zap, title: "Smart Routing Swap", desc: "Best price across all DEXs with automated slippage protection." },
]

export default function LandingPage() {
  const { isConnected } = useWallet()
  const { open } = useAppKit()

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `@keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-33.33%); } }` }} />
      <TickerBar />
      <TopNav />
      <ParticleBackground />

      <main className="flex-1 flex flex-col items-center z-10">
        {/* Hero */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Web3Vault V2 is Live · 19 Services
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-none">
            Secure, Trade, Bridge and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Grow Your Digital Assets</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/55 max-w-2xl mb-10">
            The premium crypto command center. Manage your portfolio, swap tokens, stake assets, and discover airdrops — all in one powerful terminal.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4">
            {isConnected ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  Launch App <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button size="lg" onClick={() => open()}
                  className="h-14 px-8 text-lg font-bold w-full sm:w-auto gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  Connect Wallet <ArrowRight className="w-5 h-5" />
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto glass-card">
                    Explore Demo
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </section>

        {/* Services Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Everything in one terminal</h2>
            <p className="text-white/45 text-sm">Click any service to get started</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SERVICES.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <Link href={s.href}>
                  <div className={`flex flex-col items-center gap-3 p-5 rounded-2xl border cursor-pointer transition-all group ${s.bg} ${s.glow}`}>
                    <div className={`p-3 rounded-xl bg-black/30 group-hover:scale-110 transition-transform`}>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <span className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors tracking-wide text-center leading-tight">{s.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-black/20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Built for serious crypto users</h2>
            <p className="text-white/45 max-w-2xl mx-auto">Stop jumping between ten different tabs. Web3Vault integrates the entire DeFi ecosystem into a single cohesive interface.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-7 rounded-2xl flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Total Volume", value: "$4.2B+" },
              { label: "Active Users", value: "125K+" },
              { label: "Supported Chains", value: "14" },
              { label: "Services", value: "19" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 mb-2">{stat.value}</div>
                <div className="text-xs text-white/45 uppercase tracking-widest font-mono">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-primary/20 blur-[100px] -z-10" />
            <h2 className="text-3xl md:text-4xl font-bold mb-5">Ready to upgrade your crypto experience?</h2>
            <p className="text-lg text-white/55 mb-8 max-w-xl mx-auto">Join the most advanced DeFi platform and take control of your digital wealth — for free.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                onClick={() => !isConnected && open()}>
                {isConnected ? <Link href="/dashboard">Enter Vault</Link> : "Connect Wallet to Start"}
              </Button>
              {!isConnected && (
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold glass-card">Explore Demo</Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        <footer className="w-full py-8 border-t border-white/5 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/35">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Web3Vault © {new Date().getFullYear()} · Non-custodial · Open source</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
      {/* Wallet modal is managed globally via zustand in TopNav / AppLayout */}
    </div>
  )
}
