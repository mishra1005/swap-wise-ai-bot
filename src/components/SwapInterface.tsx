
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown } from 'lucide-react';

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

export const SwapInterface: React.FC = () => {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');

  return (
    <Card className="w-full max-w-md mx-auto p-4 bg-dark-subtle border-dark-subtle">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-dark border-dark-subtle text-white"
            />
          </div>
          <div className="flex justify-center py-2">
            <div className="bg-dark-subtle p-2 rounded-full">
              <ArrowDown className="h-4 w-4 text-accent" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={toToken} onValueChange={setToToken}>
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
              value={amount ? Number(amount) * 1800 : ''} // Mock conversion rate
              className="bg-dark border-dark-subtle text-white"
            />
          </div>
        </div>
        <Button className="w-full bg-accent hover:bg-accent-hover">
          Swap
        </Button>
      </div>
    </Card>
  );
};
