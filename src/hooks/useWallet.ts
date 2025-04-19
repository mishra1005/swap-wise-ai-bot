
import { useState, useCallback } from 'react';

interface Wallet {
  address: string;
  type: 'MetaMask' | 'Phantom' | 'Backpack';
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async (type: Wallet['type']) => {
    setConnecting(true);
    try {
      // Mock wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWallet({
        address: '0x' + Array(40).fill(0).map(() => Math.random().toString(16)[2]).join(''),
        type
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
  }, []);

  return {
    wallet,
    connecting,
    connect,
    disconnect
  };
};
