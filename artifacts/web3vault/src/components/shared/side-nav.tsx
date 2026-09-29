import { Link, useLocation } from "wouter"
import {
  LayoutDashboard,
  LineChart,
  ArrowLeftRight,
  Network,
  ShieldAlert,
  Gift,
  Trophy,
  PieChart,
  Image as ImageIcon,
  History,
  User,
  Settings,
  Shield,
  Zap,
  Layers,
  BarChart2,
  Key,
  Coins,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Portfolio", href: "/portfolio", icon: PieChart },
      { name: "Transactions", href: "/transactions", icon: History },
    ],
  },
  {
    label: "Trading & DeFi",
    items: [
      { name: "Trading Terminal", href: "/trading", icon: LineChart },
      { name: "Token Swap", href: "/swap", icon: ArrowLeftRight },
      { name: "Bridge", href: "/bridge", icon: Network },
      { name: "Staking", href: "/staking", icon: Zap, highlight: true },
      { name: "DeFi Hub", href: "/defi-hub", icon: Layers },
    ],
  },
  {
    label: "Earn & Discover",
    items: [
      { name: "Airdrops", href: "/airdrops", icon: Gift },
      { name: "Rewards", href: "/rewards", icon: Trophy },
      { name: "Free Tokens", href: "/free-tokens", icon: Coins, highlight: true },
    ],
  },
  {
    label: "Security & Tools",
    items: [
      { name: "Wallet Guard", href: "/wallet-guard", icon: ShieldAlert, highlight: true },
      { name: "NFT Vault", href: "/nfts", icon: ImageIcon },
      { name: "Analytics", href: "/analytics", icon: BarChart2 },
      { name: "Recovery", href: "/recovery", icon: Key },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Profile", href: "/profile", icon: User },
      { name: "Admin", href: "/admin", icon: Settings },
    ],
  },
]

export function SideNav() {
  const [location] = useLocation()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleSection = (label: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <aside className="w-60 flex-shrink-0 border-r border-white/5 bg-[#0B1220]/60 backdrop-blur-xl hidden lg:flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = collapsed.has(section.label)
          return (
            <div key={section.label} className="mb-1">
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
              >
                {section.label}
                <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && section.items.map((item) => {
                const isActive = location === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-white/55 hover:text-white hover:bg-white/5"
                    } ${"highlight" in item && item.highlight && !isActive ? "text-cyan-400 hover:text-cyan-300" : ""}`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-primary" : "highlight" in item && item.highlight ? "text-cyan-400" : "text-white/35 group-hover:text-white/60"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                    {"highlight" in item && item.highlight && !isActive && (
                      <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Status footer */}
      <div className="p-3 border-t border-white/5">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[11px] font-semibold text-white/70">Vault Status</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/35">Network</span>
            <span className="text-green-400 font-mono">Operational</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/35">Latency</span>
            <span className="text-white font-mono">14ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/35">Services</span>
            <span className="text-primary font-mono">19 Live</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
