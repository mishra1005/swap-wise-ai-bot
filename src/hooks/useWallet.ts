
import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner, formatEther } from 'ethers';
import { toast } from 'sonner';

interface Wallet {
  address: string;
  type: 'MetaMask' | 'WalletConnect' | 'Coinbase';
  signer?: JsonRpcSigner;
  balance?: string;
  chainId?: string;
  network?: string;
}

// Sepolia testnet chain ID and configuration
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia in hex
const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  // Check for existing connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balance = formatEther(await provider.getBalance(address));
          const network = await provider.getNetwork();
          
          setWallet({
            address,
            type: detectWalletType(),
            signer,
            balance,
            chainId: network.chainId.toString(),
            network: network.name
          });
          
          console.log("Wallet connected:", { address, network: network.name, chainId: network.chainId.toString() });
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

  const switchToSepoliaNetwork = async () => {
    if (!window.ethereum) {
      toast.error('No wallet detected');
      return false;
    }
    
    setSwitchingNetwork(true);
    try {
      // First try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      toast.success('Switched to Sepolia testnet');
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
          toast.success('Added and switched to Sepolia testnet');
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          toast.error('Failed to add Sepolia network. Please add it manually.');
          return false;
        }
      } else {
        console.error('Failed to switch to Sepolia:', switchError);
        toast.error('Failed to switch to Sepolia network');
        return false;
      }
    } finally {
      setSwitchingNetwork(false);
    }
  };

  const connect = useCallback(async (type: Wallet['type']) => {
    setConnecting(true);
    try {
      if (!window.ethereum) {
        throw new Error(`Please install a wallet extension like MetaMask`);
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found or user rejected the connection');
      }
      
      // Connect provider
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = formatEther(await provider.getBalance(address));
      const network = await provider.getNetwork();

      // Set wallet state
      setWallet({
        address,
        type,
        signer,
        balance,
        chainId: network.chainId.toString(),
        network: network.name
      });

      console.log("Connected wallet:", { address, network: network.name, chainId: network.chainId.toString() });

      // Check if we need to switch to Sepolia
      if (network.chainId.toString() !== SEPOLIA_CHAIN_ID && network.name !== 'sepolia') {
        toast.info('Switching to Sepolia testnet...');
        await switchToSepoliaNetwork();
      }

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

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Network changed to:', chainId);
        // Force refresh
        window.location.reload();
      });

      toast.success('Wallet connected successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return false;
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
      window.ethereum.removeAllListeners('chainChanged');
    }
  }, []);

  const requestAirdrop = useCallback(async (tokenSymbol: string = 'ETH', amount: string = '1') => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsAirdropping(true);
    try {
      // Check if on Sepolia
      if (wallet.signer) {
        const network = await wallet.signer.provider.getNetwork();
        
        // Switch to Sepolia if not already on it
        if (network.name !== 'sepolia' && network.chainId.toString() !== SEPOLIA_CHAIN_ID) {
          const switched = await switchToSepoliaNetwork();
          if (!switched) {
            toast.error('Please switch to Sepolia testnet to request tokens');
            return false;
          }
        }
        
        // Request testnet ETH from Sepolia faucet
        toast.success(`Requested ${amount} ${tokenSymbol} on Sepolia testnet`);
        
        // Open Sepolia faucet in new window
        window.open(`https://sepoliafaucet.com/?address=${wallet.address}`, '_blank');
        return true;
      }
      return false;
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
    switchingNetwork,
    connect,
    disconnect,
    requestAirdrop,
    switchToSepoliaNetwork
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
