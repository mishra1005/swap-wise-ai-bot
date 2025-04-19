
import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import { SwapInterface } from '../SwapInterface';
import { TransactionHistory } from '../TransactionHistory';
import { generateBotResponse } from '@/utils/chatHelpers';
import { useWallet } from '@/hooks/useWallet';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: string;
  component?: 'swap' | 'history';
}

export const ChatInterface: React.FC = () => {
  const { wallet } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Welcome to EthSwap! I can help you swap cryptocurrencies. First, let's connect your wallet to get started.",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        content: generateBotResponse(input),
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Add components based on message content
      if (input.toLowerCase().includes('swap')) {
        botResponse.component = 'swap';
      } else if (input.toLowerCase().includes('history') || input.toLowerCase().includes('transactions')) {
        botResponse.component = 'history';
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark">
      <ScrollArea className="flex-1 p-4 bg-chat-gradient" ref={scrollRef}>
        {messages.map((message, index) => (
          <div key={index}>
            <MessageBubble
              content={message.content}
              isBot={message.isBot}
              timestamp={message.timestamp}
            />
            {message.component === 'swap' && wallet && (
              <div className="my-4">
                <SwapInterface />
              </div>
            )}
            {message.component === 'history' && wallet && (
              <div className="my-4">
                <TransactionHistory />
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t border-dark-subtle bg-dark">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="bg-dark-subtle border-dark-subtle text-white"
          />
          <Button onClick={handleSend} className="bg-accent hover:bg-accent-hover">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
