import { create } from 'zustand';

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  syncConnection: (address: string, chainId: number) => void;
  disconnect: () => void;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  chainId: null,
  isConnected: false,
  syncConnection: (address, chainId) => {
    set({ address, chainId, isConnected: true });
  },
  disconnect: () => {
    set({ address: null, chainId: null, isConnected: false });
  },
}));
