
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';

export const WalletConnection: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { wallet, connecting, connect, disconnect } = useWallet();

  const handleConnect = async (type: 'MetaMask' | 'Phantom' | 'Backpack') => {
    await connect(type);
    setDialogOpen(false);
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
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
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
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleConnect('MetaMask')}
            >
              MetaMask
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleConnect('Phantom')}
            >
              Phantom
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleConnect('Backpack')}
            >
              Backpack
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
