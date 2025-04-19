
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'ETC', name: 'Ethereum Classic' },
  { symbol: 'ARB', name: 'Arbitrum' },
  { symbol: 'JUP', name: 'Jupiter' },
];

// Mock exchange rates against USD
const EXCHANGE_RATES: Record<string, number> = {
  'ETH': 1800,
  'USDC': 1,
  'SOL': 40,
  'BTC': 35000,
  'USDT': 1,
  'ETC': 15,
  'ARB': 0.8,
  'JUP': 0.5,
};

export const SwapInterface: React.FC = () => {
  const { wallet } = useWallet();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapCompleted, setSwapCompleted] = useState(false);

  // Calculate converted amount based on exchange rates
  const calculateConversion = (fromAmount: string, from: string, to: string) => {
    if (!fromAmount || isNaN(Number(fromAmount))) return '';
    
    const fromValue = Number(fromAmount);
    const fromRate = EXCHANGE_RATES[from] || 1;
    const toRate = EXCHANGE_RATES[to] || 1;
    
    // Convert from token to USD, then to the target token
    const usdValue = fromValue * fromRate;
    const toValue = usdValue / toRate;
    
    return toValue.toFixed(6);
  };

  const handleFromTokenChange = (value: string) => {
    setFromToken(value);
    // Don't allow the same token for both from and to
    if (value === toToken) {
      // Set to first different token in the list
      const differentToken = TOKENS.find(token => token.symbol !== value)?.symbol || '';
      setToToken(differentToken);
    }
  };

  const handleToTokenChange = (value: string) => {
    setToToken(value);
    // Don't allow the same token for both from and to
    if (value === fromToken) {
      // Set to first different token in the list
      const differentToken = TOKENS.find(token => token.symbol !== value)?.symbol || '';
      setFromToken(differentToken);
    }
  };

  const handleSwap = async () => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSwapping(true);
    
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful swap
      const txHash = '0x' + Array(64).fill(0).map(() => Math.random().toString(16)[2]).join('');
      
      setSwapCompleted(true);
      toast.success(`Successfully swapped ${amount} ${fromToken} to ${calculateConversion(amount, fromToken, toToken)} ${toToken}`);
      
      // Reset after delay
      setTimeout(() => {
        setSwapCompleted(false);
        setAmount('');
      }, 3000);
      
    } catch (error) {
      toast.error('Swap failed. Please try again.');
      console.error('Swap error:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleMaxClick = () => {
    // Simulate max balance for the selected token
    const maxBalances: Record<string, string> = {
      'ETH': '1.5',
      'USDC': '2500',
      'SOL': '25',
      'BTC': '0.05',
      'USDT': '1000',
      'ETC': '10',
      'ARB': '500',
      'JUP': '1000',
    };
    
    setAmount(maxBalances[fromToken] || '0');
  };

  const convertedAmount = calculateConversion(amount, fromToken, toToken);

  return (
    <Card className="w-full max-w-md mx-auto p-4 bg-dark-subtle border-dark-subtle">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Select value={fromToken} onValueChange={handleFromTokenChange}>
              <SelectTrigger className="w-[120px] bg-dark border-dark-subtle">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-dark-subtle border-dark-subtle">
                {TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-dark border-dark-subtle text-white pr-16"
                disabled={isSwapping}
              />
              {wallet && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-500 hover:text-green-400"
                  onClick={handleMaxClick}
                >
                  MAX
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-center py-2">
            <div className="bg-dark-subtle p-2 rounded-full">
              <ArrowDown className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={toToken} onValueChange={handleToTokenChange}>
              <SelectTrigger className="w-[120px] bg-dark border-dark-subtle">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-dark-subtle border-dark-subtle">
                {TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              disabled
              value={convertedAmount}
              className="bg-dark border-dark-subtle text-white"
            />
          </div>
        </div>
        
        {wallet && (
          <div className="text-xs text-gray-400 flex justify-between">
            <span>Fee: 1%</span>
            <span>Network: Testnet</span>
          </div>
        )}
        
        <Button 
          className={`w-full ${swapCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}
          onClick={handleSwap}
          disabled={isSwapping || !amount || !wallet}
        >
          {!wallet ? 'Connect Wallet' : 
           isSwapping ? 'Swapping...' : 
           swapCompleted ? 'Swap Successful!' : 'Swap'}
        </Button>
      </div>
    </Card>
  );
};
