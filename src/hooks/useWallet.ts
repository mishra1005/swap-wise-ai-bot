
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Wallet {
  address: string;
  type: 'MetaMask' | 'Phantom' | 'Backpack';
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);

  const connect = useCallback(async (type: Wallet['type']) => {
    setConnecting(true);
    try {
      // Mock wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWallet({
        address: '0x' + Array(40).fill(0).map(() => Math.random().toString(16)[2]).join(''),
        type
      });
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    toast.info('Wallet disconnected');
  }, []);

  const requestAirdrop = useCallback(async (tokenSymbol: string = 'ETH', amount: string = '1') => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsAirdropping(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful airdrop
      toast.success(`Successfully airdropped ${amount} ${tokenSymbol} to your wallet`);
      return true;
    } catch (error) {
      console.error('Airdrop failed:', error);
      toast.error('Airdrop failed. Please try again later.');
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
