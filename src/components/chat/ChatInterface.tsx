
import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import { SwapInterface } from '../SwapInterface';
import { TransactionHistory } from '../TransactionHistory';
import { generateBotResponse, parseAirdropCommand, parseSwapCommand } from '@/utils/chatHelpers';
import { useWallet } from '@/hooks/useWallet';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: string;
  component?: 'swap' | 'history';
}

export const ChatInterface: React.FC = () => {
  const { wallet, requestAirdrop } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Welcome to EthSwap! I can help you swap cryptocurrencies. First, let's connect your wallet to get started.",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || processingCommand) return;

    const userMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setProcessingCommand(true);

    // Process special commands
    const airdropCommand = parseAirdropCommand(userInput);
    const swapCommand = parseSwapCommand(userInput);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Handle airdrop command
    if (airdropCommand) {
      const botResponse: Message = {
        content: `Processing airdrop request for ${airdropCommand.amount} ${airdropCommand.token}...`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, botResponse]);
      
      // Process the airdrop
      const result = await requestAirdrop(airdropCommand.token, airdropCommand.amount);
      
      const resultMessage: Message = {
        content: result 
          ? `Successfully received ${airdropCommand.amount} ${airdropCommand.token} from the testnet faucet!` 
          : `There was an issue with the airdrop request. Please try again later.`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, resultMessage]);
      setProcessingCommand(false);
      return;
    }
    
    // Handle swap command with extracted values
    if (swapCommand) {
      const botResponse: Message = {
        content: `I'll help you swap ${swapCommand.amount} ${swapCommand.fromToken} to ${swapCommand.toToken}.`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        component: 'swap'
      };
      
      setMessages(prev => [...prev, botResponse]);
      setProcessingCommand(false);
      return;
    }

    // Handle regular message
    setTimeout(() => {
      const botResponse: Message = {
        content: generateBotResponse(userInput),
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Add components based on message content
      if (userInput.toLowerCase().includes('swap')) {
        botResponse.component = 'swap';
      } else if (userInput.toLowerCase().includes('history') || userInput.toLowerCase().includes('transactions')) {
        botResponse.component = 'history';
      }

      setMessages((prev) => [...prev, botResponse]);
      setProcessingCommand(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark">
      <ScrollArea className="flex-1 p-4 bg-chat-gradient" ref={scrollRef}>
        {messages.map((message, index) => (
          <div key={index} className={message.isBot ? "" : "animate-fade-in"}>
            <MessageBubble
              content={message.content}
              isBot={message.isBot}
              timestamp={message.timestamp}
            />
            {message.component === 'swap' && wallet && (
              <div className="my-4 animate-fade-in">
                <SwapInterface />
              </div>
            )}
            {message.component === 'history' && wallet && (
              <div className="my-4 animate-fade-in">
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
            disabled={processingCommand}
          />
          <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600" disabled={processingCommand}>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
