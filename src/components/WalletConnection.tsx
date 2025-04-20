
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const WalletConnection: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { wallet, connecting, switchingNetwork, connect, disconnect, switchToSepoliaNetwork } = useWallet();
  const [availableWallets, setAvailableWallets] = useState<Array<{
    id: string;
    name: string;
    type: 'MetaMask' | 'WalletConnect' | 'Coinbase';
    available: boolean;
    icon?: string;
  }>>([
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      type: 'MetaMask', 
      available: false, 
      icon: 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjM1NSIgdmlld0JveD0iMCAwIDM5NyAzNTUiIHdpZHRoPSIzOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMSkiPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTIuMDA0NzE3IDEzLjgxMDE5OHYtMTguMDU5NDlsNC4yNDUyODMtNC4yNDkyOTJoMjkuNzE2OTgydjIxLjI0NjQ1OSAxNC44NzI1MjNoLTMxLjgzOTYyNGwtMzkuMjY4ODY4LTE2Ljk5NzE2OXoiIGZpbGw9IiNjZGJkYjIiLz48cGF0aCBkPSJtMTk5LjUyODMwNSAzMjcuMTk1NDcyIDUwLjk0MzM5NyAxMy44MTAxOTh2LTE4LjA1OTQ5bDQuMjQ1MjgzLTQuMjQ5MjkyaDI5LjcxNjk4MXYyMS4yNDY0NTkgMTQuODcyNTIzaC0zMS44Mzk2MjNsLTM5LjI2ODg2OC0xNi45OTcxNjl6IiBmaWxsPSIjY2RiZGIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSA0ODMuOTYyMjcgMCkiLz48cGF0aCBkPSJtMTcwLjg3MjY0NCAyODcuODg5NTIzLTQuMjQ1MjgzIDM1LjA1NjY1NyA1LjMwNjYwNC00LjI0OTI5Mmg1NS4xODg2OGw2LjM2NzkyNSA0LjI0OTI5Mi00LjI0NTI4NC0zNS4wNTY2NTctOC40OTA1NjUtNS4zMTE2MTUtNDIuNDUyODMyIDEuMDYyMzIzeiIgZmlsbD0iIzM5MzkzOSIvPjxwYXRoIGQ9Im0xNDIuMjE2OTg0IDUwLjk5MTUwMjIgMjUuNDcxNjk4IDU5LjQ5MDA4NTggMTEuNjc0NTI4IDE3My4xNTg2NDNoNDEuMzkxNTExbDEyLjczNTg0OS0xNzMuMTU4NjQzIDIzLjM0OTA1Ni01OS40OTAwODU4eiIgZmlsbD0iI2Y4OWMzNSIvPjxwYXRoIGQ9Im0zMC43NzgzMDIzIDE4MS42NTcyMjYtMjkuNzE2OTgxNSA4Ni4wNDgxNjEgNzQuMjkyNDUzOSAzLjE4Njk2OWgtNDcuNzU5NDM0NGwyOC42NTU2NjA5IDM0LjAyNDMzOC03NC4yOTI0NTM5OCA3My42MDk2Mzl6IiBmaWxsPSIjZTg4MjFlIi8+PHBhdGggZD0ibTg3LjAyODMwMzkgMTkxLjIxODEzNCA4Ny4wMjgzMDIxIDE1Ljk5MzM3Ny4zNTMyMDUtMzAuOTI0NzUzLTIxLjY4MzAyLTcuNDE4MjA4eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im03OC41MzcyMjY0IDI1Ni4xMzM4NjIgNDYuNjk4MTEzNiA0Ni42MTg5NzUtMTAwLjc2NDE1MTUuNzA4MjA3eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0yNy41NzY2MDM4IDEzMC40NDQ3OTUgMzkuNjIyNjQxNiA0MC4wNjA0NzkgMTcuNzMzOTYyMy01OS40OTAwODYtNy4wNzU0NzE3LTM0LjAyNDMzOHoiIGZpbGw9IiNlODgyMWUiLz48cGF0aCBkPSJtMTE3LjcxMTMyMSAxMjAuODgzOTc5LTM2LjQyMjY0MjYgNS4zMTE2MTUgMjYuNTMzMDE5MyAxMy4xNzE4MzF6IiBmaWxsPSIjMzkzOTM5IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAxOTkgMCkiLz48cGF0aCBkPSJtMTI3LjI2NTA5NiA0NDcuNTAyOTQ5IDM1Ljk5OTk5OS0xNS45OTEzNjUtMy40OTAyOS02Mi45NzE1NDJoLTQ1LjExMTk2Njg4eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0xMjQuNDY2NTEgMjkxLjE3NjQzLT1mMCAwIDAgMCIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjI2IDApIi8+PHBhdGggZD0ibTEzMC45OTYsODEuNjQ2IDM4LjM3OTc2OSw0Mi4xMzcgMTAuMTY2NTY3LDI1LjU3SGwxNC44MjMyNTUsMjIuODkxMDUtMjguMDkyNzkzLTUuNTM1MzE1LTMwLjEwMTUwOCw0LjUxNDg1NnoiIGZpbGw9IiNlODgzMWUiLz48cGF0aCBkPSJtMTMyLjIxNTA2MjggMTI2LjE5NTU5NCAxMC4yNDkzOTAyIDQwLjQyOTY0MiA5LjQ4Mzc3OC00LjQ5ODMxOHoiIGZpbGw9IiM2NzQzMjkiLz48cGF0aCBkPSJtMTI0LjQ2NjUxIDI2NC44MTc0NjkuNzM5NzQ0IDE3Ljc2NTYzNiAzMi41OTE1MTEtMjcuNjYwNTEzIDEuMjYxNTY2LTM1LjcxMzc5OS0yNC4zMjE3ONciIGZpbGw9IiNjZjdjMzgiLz48cGF0aCBkPSJtMzYyLjkzMDU5MiAxNTMuMzMzNzQ1LS43MzkyNDkgNTUuMzAxODY5LTkuNDgzNzctNS4zMTE2MTYgMy43MDY3OTUtMjguMDY0MjU5eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im0zNjMuNjcwMzQxIDE1My4zMzM3NDUtMTEuMjIyMzktMTIuNjQzNzg4LTguMjI2NTAyIDQxLjM4MDU3Mk0xMzguMDE2NTcxMyA1OC4xNTMzMzMzIDE5OS41MjgzMDUzIDE1OS40NTg5NDdsMTkzLjkxOTgxOC0yNS44MjIxMDUtLjczOTc0NC01MC4yMzU0MjQ4IDkuNDgzNzcyIDE1LjcwNTcwMDggMjMuMDU3MDgzIDc0LjI5MDgzNiAxMi4yMDc2OTYgMzUuNDAwNTYzLTE5LjAxNDIzNDUgMzYuMTc2ODcxUzM5OC4wNjQwMTE5IDM1Mi4zNTI5NzMgMzk4LjA2NDAxMTkgMzUyLjM1Mjk3M2wtMTk5LjIyNjUwNjkuNjc2MTMtMTk5LjIyNzM0Ni0uNjc2MTMuNzQwOTgzLTU0Ljg0NTMzM3MtNy40NDU5OTctMzguMDY4NDAxLTcuNDQ1OTk3LTM5LjQyMDk2EMixtODEuOTM0MTE4MSA5Mi44OTEyNjYzIDIzLjc5NzY1OCA3NC4yOTA4MzYgNDMuNTQ5OTk3NiA1OC41ODUxMzU0bC0uNzQwOTgzIDU0Ljg0NTMzMzYiIGZpbGw9IiM4ZTVhMzAiLz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAzOTkgMCkiPjxwYXRoIGQ9Im0zMC43NzgzMDIzIDE4MS42NTcyMjYtMjkuNzE2OTgxNSA4Ni4wNDgxNjEgNzQuMjkyNDUzOSAzLjE4Njk2OWgtNDcuNzU5NDM0NGwyOC42NTU2NjA5IDM0LjAyNDMzOC03NC4yOTI0NTM5OCA3My42MDk2Mzl6IiBmaWxsPSIjZTg4MjFlIi8+PHBhdGggZD0ibTg3LjAyODMwMzkgMTkxLjIxODEzNCA4Ny4wMjgzMDIxIDE1Ljk5MzM3Ny4zNTMyMDUtMzAuOTI0NzUzLTIxLjY4MzAyLTcuNDE4MjA4eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im03OC41MzcyMjY0IDI1Ni4xMzM4NjIgNDYuNjk4MTEzNiA0Ni42MTg5NzUtMTAwLjc2NDE1MTUuNzA4MjA3eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0yNy41NzY2MDM4IDEzMC40NDQ3OTUgMzkuNjIyNjQxNiA0MC4wNjA0NzkgMTcuNzMzOTYyMy01OS40OTAwODYtNy4wNzU0NzE3LTM0LjAyNDMzOHoiIGZpbGw9IiNlODgyMWUiLz48cGF0aCBkPSJtMTE3LjcxMTMyMSAxMjAuODgzOTc5LTM2LjQyMjY0MjYgNS4zMTE2MTUgMjYuNTMzMDE5MyAxMy4xNzE4MzF6IiBmaWxsPSIjMzkzOTM5IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAxOTkgMCkiLz48cGF0aCBkPSJtMTI3LjI2NTA5NiA0NDcuNTAyOTQ5IDM1Ljk5OTk5OS0xNS45OTEzNjUtMy40OTAyOS02Mi45NzE1NDJoLTQ1LjExMTk2Njg4eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0xMjQuNDY2NTEgMjkxLjE3NjQzLTUmMCAwIDAgMCIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjI2IDApIi8+PHBhdGggZD0ibTEzMC45OTYsODEuNjQ2IDM4LjM3OTc2OSw0Mi4xMzcgMTAuMTY2NTY3LDI1LjU3IGwxNC44MjMyNTUsMjIuODkxMDUtMjguMDkyNzkzLTUuNTM1MzE1LTMwLjEwMTUwOCw0LjUxNDg1NnoiIGZpbGw9IiNlODgzMWUiLz48cGF0aCBkPSJtMTMyLjIxNTA2MjggMTI2LjE5NTU5NCAxMC4yNDkzOTAyIDQwLjQyOTY0MiA5LjQ4Mzc3OC00LjQ5ODMxOHoiIGZpbGw9IiM2NzQzMjkiLz48cGF0aCBkPSJtMTI0LjQ2NjUxIDI2NC44MTc0NjkuNzM5NzQ0IDE3Ljc2NTYzNiAzMi41OTE1MTEtMjcuNjYwNTEzIDEuMjYxNTY2LTM1LjcxMzc5OS0yNC4zMjE3NvEiIGZpbGw9IiNjZjdjMzgiLz48cGF0aCBkPSJtMzYyLjkzMDU5MiAxNTMuMzMzNzQ1LS43MzkyNDkgNTUuMzAxODY5LTkuNDgzNzctNS4zMTE2MTYgMy43MDY3OTUtMjguMDY0MjU5eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im0zNjMuNjcwMzQxIDE1My4zMzM3NDUtMTEuMjIyMzktMTIuNjQzNzg4LTguMjI2NTAyIDQxLjM4MDU3MiIgZmlsbD0iI2Q4N2MzMCIvPjwvZz48L2c+PC9zdmc+'
    },
    { 
      id: 'coinbase', 
      name: 'Coinbase Wallet', 
      type: 'Coinbase', 
      available: false, 
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiMwMDUyRkYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02My45OTg5IDI0TDUxLjg0MSAzNi4xNDI0TDMzLjk5MzQgMzYuMTQ0SDMyVjk1Ljk5OTZIMzkuNzEzNEw1MS44MzkgODMuODU1N0g3Ni4xNTc5TDg4LjI4NjkgOTUuOTk5NkgxMDBWMzYuMTQ0SDk1Ljk5ODFMNjMuOTk4OSAyNFpNNTEuODM5IDcxLjcxMThMNjMuOTk4OSA1OS41NzE4TDc2LjE1NzkgNzEuNzExOEg1MS44MzlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
    }
  ]);

  useEffect(() => {
    // Check which wallets are available in the browser
    const detectWallets = () => {
      try {
        console.log("Detecting wallets...");
        const wallets = [...availableWallets];
        
        if (window.ethereum) {
          console.log("Found ethereum provider:", window.ethereum);
          
          // Check for MetaMask
          if (window.ethereum.isMetaMask) {
            console.log("MetaMask detected");
            wallets.find(w => w.id === 'metamask')!.available = true;
          }
          
          // Check for Coinbase Wallet
          if (window.ethereum.isCoinbaseWallet) {
            console.log("Coinbase Wallet detected");
            wallets.find(w => w.id === 'coinbase')!.available = true;
          }
          
          // If no specific wallet detected but ethereum exists, assume generic provider
          if (!window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
            console.log("Generic Ethereum provider detected");
            // Mark MetaMask as available as a fallback
            wallets.find(w => w.id === 'metamask')!.available = true;
          }
        } else {
          console.log("No ethereum provider found");
        }
        
        setAvailableWallets(wallets);
      } catch (error) {
        console.error("Error detecting wallets:", error);
      }
    };
    
    detectWallets();
  }, []);

  const handleConnect = async (type: 'MetaMask' | 'WalletConnect' | 'Coinbase') => {
    try {
      const success = await connect(type);
      if (success) {
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
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

  const getWalletLabel = () => {
    if (!wallet) return null;
    
    if (wallet.balance) {
      let networkDisplay = '';
      
      if (wallet.network) {
        networkDisplay = wallet.network === 'sepolia' || wallet.chainId === '11155111' 
          ? ' (Sepolia)' 
          : ` (${wallet.network})`;
      }
      
      return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} • ${Number(wallet.balance).toFixed(4)} ETH${networkDisplay}`;
    }
    
    return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  };

  const handleSwitchNetwork = async () => {
    if (wallet) {
      await switchToSepoliaNetwork();
    } else {
      toast.error('Connect your wallet first');
      setDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 p-4 bg-dark border-b border-dark-subtle">
        {wallet && wallet.network !== 'sepolia' && wallet.chainId !== '11155111' && (
          <Button
            variant="destructive"
            className="text-xs"
            onClick={handleSwitchNetwork}
            disabled={switchingNetwork}
          >
            {switchingNetwork ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Switching...
              </>
            ) : (
              'Switch to Sepolia'
            )}
          </Button>
        )}
        
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
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
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
                    className="bg-green-500 hover:bg-green-600 text-white w-full flex items-center justify-between"
                    onClick={() => handleConnect(wallet.type)}
                    disabled={connecting}
                  >
                    <span>Connect {wallet.name}</span>
                    {wallet.icon && (
                      <img src={wallet.icon} alt={wallet.name} className="h-6 w-6" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white w-full flex items-center justify-between"
                    onClick={() => handleInstallClick(wallet.id)}
                  >
                    <span>Install {wallet.name}</span>
                    {wallet.icon && (
                      <img src={wallet.icon} alt={wallet.name} className="h-6 w-6 opacity-70" />
                    )}
                  </Button>
                )}
              </div>
            ))}
            
            {!window.ethereum && (
              <p className="text-center text-sm text-gray-400 mt-2">
                No web3 wallet detected. Please install a wallet extension to continue.
              </p>
            )}
            
            {window.ethereum && !availableWallets.some(w => w.available) && (
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
