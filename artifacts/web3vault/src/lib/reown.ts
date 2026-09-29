import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import {
  arbitrum,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
  type AppKitNetwork,
} from "@reown/appkit/networks"

export const REOWN_PROJECT_ID = "03d5d56b0d161c475d95099e26c4b174"

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  polygon,
  bsc,
  base,
  optimism,
]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId: REOWN_PROJECT_ID,
  ssr: false,
})

export const reownMetadata = {
  name: "Web3Vault",
  description: "Premium Web3 crypto command center",
  url: typeof window === "undefined" ? "http://localhost" : window.location.origin,
  icons: [],
}

// AppKit must be created once at module scope.
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId: REOWN_PROJECT_ID,
  metadata: reownMetadata,
  features: {
    analytics: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#3b82f6",
    "--w3m-border-radius-master": "12px",
  },
})