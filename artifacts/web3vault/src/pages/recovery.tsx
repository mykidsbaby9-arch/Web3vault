import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Key, Shield, AlertTriangle, CheckCircle2, Lock, Eye, EyeOff, BookOpen, HelpCircle, Fingerprint, Download, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/hooks/use-wallet"
import { WalletRequiredCard } from "@/components/shared/wallet-gate"

const RECOVERY_OPTIONS = [
  { id: "seed",        title: "Recover from Seed Phrase", desc: "Import using your 12 or 24-word recovery phrase", icon: BookOpen,    risk: "High"   },
  { id: "keystore",   title: "Keystore File Import",      desc: "Upload an encrypted keystore JSON file",          icon: Key,         risk: "Medium" },
  { id: "private-key",title: "Private Key Import",        desc: "Import directly with your wallet private key",    icon: Fingerprint, risk: "High"   },
  { id: "social",     title: "Social Recovery",           desc: "Recover via trusted guardians (MPC wallets)",     icon: Shield,      risk: "Low"    },
]

const SECURITY_TIPS = [
  "Never share your seed phrase with anyone, including Web3Vault support.",
  "Never enter your seed phrase on websites you don't trust.",
  "Store your recovery phrase offline in a secure physical location.",
  "Consider using a hardware wallet for large holdings.",
  "Enable 2FA on all exchange accounts.",
  "Use a unique email and strong password for each service.",
]

export default function Recovery() {
  const { isConnected } = useWallet()
  const [selected, setSelected] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [seedPhrase, setSeedPhrase] = useState("")
  const [showSeed, setShowSeed] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [imported, setImported] = useState(false)

  const wordCount = seedPhrase.trim().split(/\s+/).filter(Boolean).length

  const handleImport = () => {
    if (wordCount !== 12 && wordCount !== 24) return
    setIsImporting(true)
    setTimeout(() => {
      setIsImporting(false)
      setImported(true)
    }, 2500)
  }

  if (!isConnected) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Key className="w-8 h-8 text-orange-400" /> Wallet Recovery
          </h1>
          <p className="text-white/60 mt-1">Securely restore access to your wallet using your recovery credentials.</p>
        </div>
        <WalletRequiredCard
          title="Connect Wallet to Access Recovery"
          description="You need to connect your wallet first before accessing recovery options. This ensures your recovery process is secure."
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Key className="w-8 h-8 text-orange-400" /> Wallet Recovery
        </h1>
        <p className="text-white/60 mt-1">Securely restore access to your wallet using your recovery credentials.</p>
      </div>

      {/* Security Warning */}
      <div className="flex gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-orange-400 mb-1">Security Warning</p>
          <p className="text-white/60">This page operates entirely in your browser. Your seed phrase is never transmitted over the network. Always verify the URL before entering credentials.</p>
        </div>
      </div>

      {/* Recovery Options */}
      {!selected && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Choose Recovery Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RECOVERY_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelected(opt.id)}
                className="p-5 text-left glass-panel border-white/5 hover:border-white/20 rounded-2xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <opt.icon className="w-5 h-5 text-white/60 group-hover:text-primary transition-colors" />
                  </div>
                  <Badge className={`text-[10px] ${opt.risk === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' : opt.risk === 'Medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {opt.risk} Risk
                  </Badge>
                </div>
                <h3 className="font-bold mb-1 group-hover:text-white transition-colors">{opt.title}</h3>
                <p className="text-sm text-white/50">{opt.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Seed Phrase Import Flow */}
      <AnimatePresence>
        {selected === "seed" && (
          <motion.div key="seed-flow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Seed Phrase Recovery</h2>
              <button onClick={() => { setSelected(null); setImported(false); setSeedPhrase("") }} className="text-sm text-white/40 hover:text-white transition-colors">← Change method</button>
            </div>

            {imported ? (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5 p-10 glass-panel border-green-500/20 rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-green-400">Wallet Recovered!</h3>
                  <p className="text-white/50 mt-2">Your wallet has been successfully imported. Your assets are now accessible.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 gap-2 text-sm">
                    <Download className="w-4 h-4" /> Export Keystore
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-white text-sm">Go to Dashboard</Button>
                </div>
              </motion.div>
            ) : (
              <Card className="glass-panel border-white/5">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-white/70">Recovery Phrase</label>
                      <button
                        onClick={() => setShowSeed(!showSeed)}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
                      >
                        {showSeed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showSeed ? "Hide" : "Show"}
                      </button>
                    </div>
                    <Textarea
                      value={seedPhrase}
                      onChange={e => setSeedPhrase(e.target.value)}
                      placeholder="Enter your 12 or 24-word recovery phrase, separated by spaces…"
                      className={`min-h-[120px] bg-black/40 border-white/10 text-white font-mono text-sm placeholder:text-white/20 resize-none focus:border-primary/40 ${!showSeed && seedPhrase ? "text-transparent [text-shadow:0_0_8px_rgba(255,255,255,0.5)]" : ""}`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-white/40">{wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? "s" : ""}` : "0 words"} entered</p>
                      {wordCount > 0 && (wordCount === 12 || wordCount === 24) ? (
                        <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Valid length</p>
                      ) : wordCount > 0 ? (
                        <p className="text-xs text-red-400">Must be 12 or 24 words</p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    className="w-full h-11 font-bold bg-primary hover:bg-primary/90 text-white gap-2"
                    disabled={(wordCount !== 12 && wordCount !== 24) || isImporting}
                    onClick={handleImport}
                  >
                    {isImporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing Wallet…</> : <><Key className="w-4 h-4" /> Import Wallet</>}
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Keystore placeholder */}
        {selected === "keystore" && (
          <motion.div key="keystore" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Keystore File Import</h2>
              <button onClick={() => setSelected(null)} className="text-sm text-white/40 hover:text-white transition-colors">← Change method</button>
            </div>
            <Card className="glass-panel border-white/5">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
                  <Key className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-white/60">Keystore file import is coming soon. Use seed phrase recovery for now.</p>
                <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => setSelected("seed")}>
                  Switch to Seed Phrase
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Private key placeholder */}
        {(selected === "private-key" || selected === "social") && (
          <motion.div key="other" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{selected === "private-key" ? "Private Key Import" : "Social Recovery"}</h2>
              <button onClick={() => setSelected(null)} className="text-sm text-white/40 hover:text-white transition-colors">← Change method</button>
            </div>
            <Card className="glass-panel border-white/5">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="text-white/60">
                  {selected === "private-key"
                    ? "Private key import will be available in the next update."
                    : "Social recovery via trusted guardians is coming soon."}
                </p>
                <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => setSelected(null)}>
                  Choose Another Method
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security tips */}
      {!selected && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white/70 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Security Tips
          </h2>
          <div className="grid gap-2">
            {SECURITY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-lg border border-white/5">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-white/60">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
