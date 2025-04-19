
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
  {
    id: '0x123',
    fromToken: 'ETH',
    toToken: 'USDC',
    fromAmount: '1.5',
    toAmount: '2700',
    timestamp: '2024-04-19 10:30 AM',
    status: 'completed',
  },
  {
    id: '0x456',
    fromToken: 'USDC',
    toToken: 'SOL',
    fromAmount: '1000',
    toAmount: '40',
    timestamp: '2024-04-19 11:15 AM',
    status: 'completed',
  },
];

export const TransactionHistory: React.FC = () => {
  return (
    <Card className="bg-dark-subtle border-dark-subtle p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Transaction History</h2>
      <ScrollArea className="h-[200px]">
        <div className="space-y-3">
          {mockTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg bg-dark border border-dark-subtle"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">
                  {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  tx.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                  tx.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {tx.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {tx.timestamp}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
