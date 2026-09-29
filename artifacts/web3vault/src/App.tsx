import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { AppLayout } from '@/components/layout/app-layout';
import { WalletConnectionFlow } from '@/components/shared/wallet-connection-flow';
import { wagmiAdapter } from '@/lib/reown';
import { useWallet } from '@/hooks/use-wallet';

// Pages
import LandingPage from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import Trading from '@/pages/trading';
import Swap from '@/pages/swap';
import Bridge from '@/pages/bridge';
import WalletGuard from '@/pages/wallet-guard';
import Airdrops from '@/pages/airdrops';
import Rewards from '@/pages/rewards';
import Portfolio from '@/pages/portfolio';
import NFTs from '@/pages/nfts';
import Transactions from '@/pages/transactions';
import Profile from '@/pages/profile';
import Notifications from '@/pages/notifications';
import Admin from '@/pages/admin';
import Staking from '@/pages/staking';
import DeFiHub from '@/pages/defi-hub';
import Analytics from '@/pages/analytics';
import Recovery from '@/pages/recovery';
import FreeTokens from '@/pages/free-tokens';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// ─── Scroll to top on every route change ─────────────────────────────────────
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function WalletStateSync() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const syncConnection = useWallet((state) => state.syncConnection);
  const disconnect = useWallet((state) => state.disconnect);

  useEffect(() => {
    if (isConnected && address) {
      syncConnection(address, typeof chainId === 'number' ? chainId : 1);
    } else {
      disconnect();
    }
  }, [address, chainId, disconnect, isConnected, syncConnection]);

  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
        <Route path="/trading"><ProtectedRoute component={Trading} /></Route>
        <Route path="/swap"><ProtectedRoute component={Swap} /></Route>
        <Route path="/bridge"><ProtectedRoute component={Bridge} /></Route>
        <Route path="/wallet-guard"><ProtectedRoute component={WalletGuard} /></Route>
        <Route path="/airdrops"><ProtectedRoute component={Airdrops} /></Route>
        <Route path="/rewards"><ProtectedRoute component={Rewards} /></Route>
        <Route path="/portfolio"><ProtectedRoute component={Portfolio} /></Route>
        <Route path="/nfts"><ProtectedRoute component={NFTs} /></Route>
        <Route path="/transactions"><ProtectedRoute component={Transactions} /></Route>
        <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
        <Route path="/notifications"><ProtectedRoute component={Notifications} /></Route>
        <Route path="/admin"><ProtectedRoute component={Admin} /></Route>
        <Route path="/staking"><ProtectedRoute component={Staking} /></Route>
        <Route path="/defi-hub"><ProtectedRoute component={DeFiHub} /></Route>
        <Route path="/analytics"><ProtectedRoute component={Analytics} /></Route>
        <Route path="/recovery"><ProtectedRoute component={Recovery} /></Route>
        <Route path="/free-tokens"><ProtectedRoute component={FreeTokens} /></Route>
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
              <p className="text-white/60">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <WalletStateSync />
          <Router />
          <WalletConnectionFlow />
        </WouterRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
