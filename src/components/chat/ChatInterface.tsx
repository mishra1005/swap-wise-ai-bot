
import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import { SwapInterface } from '../SwapInterface';
import { TransactionHistory } from '../TransactionHistory';
import { parseAirdropCommand, parseSwapCommand } from '@/utils/chatHelpers';
import { useWallet } from '@/hooks/useWallet';
import { generateAIResponse } from '@/services/aiService';
import { toast } from 'sonner';
import { Message } from '@/types/chat';

export const ChatInterface: React.FC = () => {
  const { wallet, requestAirdrop } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Welcome to EthSwap! I can help you swap cryptocurrencies and answer any crypto-related questions. How can I assist you today?",
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

    try {
      // Process special commands first
      const airdropCommand = parseAirdropCommand(userInput);
      const swapCommand = parseSwapCommand(userInput);

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
            ? `Successfully initiated airdrop request for ${airdropCommand.amount} ${airdropCommand.token} to your wallet. Check your wallet for the transaction.` 
            : `There was an issue with the airdrop request. Please make sure you're on a testnet.`,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages(prev => [...prev, resultMessage]);
      } else if (swapCommand) {
        const botResponse: Message = {
          content: `I'll help you swap ${swapCommand.amount} ${swapCommand.fromToken} to ${swapCommand.toToken}.`,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
          component: 'swap'
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Generate AI response with chat history for context
        // Only send the last 10 messages for context to avoid token limits
        const recentMessages = messages.slice(-10);
        const aiResponse = await generateAIResponse(userInput, recentMessages);
        const botResponse: Message = {
          content: aiResponse,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error: any) {
      toast.error('Failed to generate response. Please try again.');
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setProcessingCommand(false);
    }
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
