// Solana Wallet Provider Setup
import React, { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const SOLANA_NETWORK = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as WalletAdapterNetwork;
const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: SOLANA_NETWORK }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
