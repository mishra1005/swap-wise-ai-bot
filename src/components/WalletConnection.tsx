
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

export const WalletConnection: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { wallet, connecting, connect, disconnect } = useWallet();
  const [availableWallets, setAvailableWallets] = useState<Array<{
    id: string;
    name: string;
    type: 'MetaMask' | 'WalletConnect' | 'Coinbase';
    available: boolean;
  }>>([
    { id: 'metamask', name: 'MetaMask', type: 'MetaMask', available: false },
    { id: 'coinbase', name: 'Coinbase Wallet', type: 'Coinbase', available: false }
  ]);

  useEffect(() => {
    // Check which wallets are available in the browser
    const detectWallets = () => {
      const wallets = [...availableWallets];
      
      if (window.ethereum?.isMetaMask) {
        wallets.find(w => w.id === 'metamask')!.available = true;
      }
      
      if (window.ethereum?.isCoinbaseWallet) {
        wallets.find(w => w.id === 'coinbase')!.available = true;
      }
      
      setAvailableWallets(wallets);
    };
    
    detectWallets();
  }, []);

  const handleConnect = async (type: 'MetaMask' | 'WalletConnect' | 'Coinbase') => {
    try {
      await connect(type);
      setDialogOpen(false);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const getWalletLabel = () => {
    if (!wallet) return null;
    
    if (wallet.balance) {
      return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} • ${Number(wallet.balance).toFixed(4)} ETH`;
    }
    
    return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  };

  const handleInstallClick = (walletType: string) => {
    let url = '';
    
    if (walletType === 'metamask') {
      url = 'https://metamask.io/download/';
    } else if (walletType === 'coinbase') {
      url = 'https://www.coinbase.com/wallet';
    }
    
    if (url) {
      window.open(url, '_blank');
      toast.info(`Redirecting to ${walletType} download page`);
    }
  };

  return (
    <>
      <div className="flex justify-end p-4 bg-dark border-b border-dark-subtle">
        {wallet ? (
          <Button 
            variant="outline" 
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={disconnect}
          >
            {getWalletLabel()}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={() => setDialogOpen(true)}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-dark-subtle border-dark-subtle text-white">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableWallets.map((wallet) => (
              <div key={wallet.id}>
                {wallet.available ? (
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white w-full"
                    onClick={() => handleConnect(wallet.type)}
                  >
                    {wallet.name}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white w-full"
                    onClick={() => handleInstallClick(wallet.id)}
                  >
                    Install {wallet.name}
                  </Button>
                )}
              </div>
            ))}
            
            {!availableWallets.some(w => w.available) && (
              <p className="text-center text-sm text-gray-400 mt-2">
                No compatible wallets detected. Please install one of the wallets above.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
