// Cross-platform preinstall guard.
// Removes stray npm/yarn lockfiles and enforces pnpm as the package manager.
// (Replaces the previous `sh -c '...'` script which broke on Windows where
//  `sh` is not available, preventing `pnpm install` from completing and
//  leaving @types/node / vite (and many other deps) uninstalled.)
const fs = require("fs")

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  try {
    fs.rmSync(lockfile, { force: true })
  } catch {}
}

// Block confirmed npm/yarn installs; allow pnpm (and anything else).
const userAgent = (process.env.npm_config_user_agent || "").toLowerCase()
if (userAgent.startsWith("npm") || userAgent.startsWith("yarn")) {
  console.error("Use pnpm instead")
  process.exit(1)
}
