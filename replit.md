# Web3Vault

Web3Vault is a React/Vite crypto dashboard with a separate Express API server, PostgreSQL/Drizzle data access, and Reown AppKit wallet selection. This is a pnpm workspace; keep the root structure intact when moving it to another Replit project.

## Start editing

- Install dependencies at the workspace root with `pnpm install`.
- Run the API with `pnpm --filter @workspace/api-server run dev`.
- Run the website with `pnpm --filter @workspace/web3vault run dev`.
- The registered artifact workflows are `artifacts/api-server: API Server` and `artifacts/web3vault: web`. Use those workflows in Replit rather than creating duplicates.
- Source lives in `artifacts/web3vault/src`, `artifacts/api-server/src`, and `lib/*/src`; the API contract lives in `lib/api-spec`.
- Check the frontend with `pnpm --filter @workspace/web3vault run typecheck`. The API's typecheck has three existing return-path errors in the airdrops, NFTs, and profile routes; its production build succeeds.

## Configuration

- The ZIP handoff does **not** include secret values, local environment files, installed dependencies, database contents, or build output.
- Set up a PostgreSQL database and its `DATABASE_URL` in the new environment. The API also uses `SESSION_SECRET`. To deliver owner-contact requests, set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as server-side secrets, never frontend variables.
- The Reown project ID in the frontend is public. A new production origin may need to be allowed in the Reown project settings.

## Behavior to preserve

- Reown AppKit is initialized once. The post-selection flow is mounted globally so it works from the landing page and other routes.
- The wallet selection intentionally opens a five-second rolling **demo** check, then an error/manual-options screen. The user explicitly asked to keep this flow. It closes AppKit after wallet selection and is **not** a completed real wallet connection; do not silently replace it during unrelated fixes.
- Manual Login requests send the entered name, email text, public wallet address, and selected wallet label to the owner via the API's Telegram route. The demo form accepts nonempty test text in those fields; success appears only after Telegram accepts the request. Never collect a seed phrase, private key, or password.

## Netlify limitation

`netlify.toml` builds the frontend from this repository for a Git-based Netlify deploy. Its `/api/*` redirect currently returns 404 on purpose because this Replit API has not been published. A Netlify-hosted frontend needs a reachable published backend and an updated API proxy rule before contact forms and other API-backed features can work. Keep Telegram credentials only on the backend.