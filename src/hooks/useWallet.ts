
import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner, formatEther } from 'ethers';
import { toast } from 'sonner';

interface Wallet {
  address: string;
  type: 'MetaMask' | 'WalletConnect' | 'Coinbase';
  signer?: JsonRpcSigner;
  balance?: string;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);

  // Check for existing connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balance = formatEther(await provider.getBalance(address));

          setWallet({
            address,
            type: detectWalletType(),
            signer,
            balance
          });
        } catch (error) {
          console.error("Failed to restore connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  const detectWalletType = (): Wallet['type'] => {
    if (window.ethereum?.isMetaMask) return 'MetaMask';
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase';
    return 'MetaMask'; // Default fallback
  };

  const connect = useCallback(async (type: Wallet['type']) => {
    setConnecting(true);
    try {
      if (!window.ethereum) {
        throw new Error(`Please install a wallet extension like MetaMask`);
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = formatEther(await provider.getBalance(address));

      setWallet({
        address,
        type,
        signer,
        balance
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet(null);
          toast.info('Wallet disconnected');
        } else {
          // Reconnect with new account
          connect(type);
        }
      });

      toast.success('Wallet connected successfully');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    toast.info('Wallet disconnected');
    
    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
    }
  }, []);

  const requestAirdrop = useCallback(async (tokenSymbol: string = 'ETH', amount: string = '1') => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsAirdropping(true);
    try {
      // For real airdrop, we would call a faucet API or contract
      // For test networks only, as mainnet requires real assets
      
      const networkName = await wallet.signer?.provider.getNetwork().then(net => net.name);
      
      if (networkName && ['sepolia', 'goerli', 'mumbai'].includes(networkName)) {
        toast.success(`Requested ${amount} ${tokenSymbol} from the ${networkName} faucet`);
        
        // Simulate faucet request here
        // In a real app, you would call a faucet API endpoint
        
        return true;
      } else {
        toast.error(`Airdrop not available on the current network. Please switch to a testnet.`);
        return false;
      }
    } catch (error: any) {
      console.error('Airdrop failed:', error);
      toast.error(error.message || 'Airdrop failed. Please try again later.');
      return false;
    } finally {
      setIsAirdropping(false);
    }
  }, [wallet]);

  return {
    wallet,
    connecting,
    isAirdropping,
    connect,
    disconnect,
    requestAirdrop
  };
};

// Add typings for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      selectedAddress?: string;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: any) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}
