import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Loader2 } from 'lucide-react';
import { SwapInterface } from '../SwapInterface';
import { TransactionHistory } from '../TransactionHistory';
import { parseAirdropCommand, parseSwapCommand } from '@/utils/chatHelpers';
import { useWallet } from '@/hooks/useWallet';
import { generateAIResponse } from '@/services/aiService';
import { toast } from 'sonner';
import { Message } from '@/types/chat';

export const ChatInterface: React.FC = () => {
  const { wallet, requestAirdrop, switchToSepoliaNetwork } = useWallet();
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
      console.log("🔍 Processing user input:", userInput);
      console.log("🔑 Current wallet status:", wallet ? "Connected" : "Not Connected");
      
      // Check if wallet is connected first for airdrop/swap commands
      const airdropCommand = parseAirdropCommand(userInput);
      const swapCommand = parseSwapCommand(userInput);
      
      console.log("🚰 Airdrop command detected:", airdropCommand);
      console.log("💱 Swap command detected:", swapCommand);
      
      if ((airdropCommand || swapCommand) && !wallet) {
        const connectMessage: Message = {
          content: "You need to connect your wallet first to use this feature. Please click the 'Connect Wallet' button at the top of the page.",
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, connectMessage]);
        setProcessingCommand(false);
        return;
      }

      // Process special commands
      if (airdropCommand && wallet) {
        console.log("💧 Processing airdrop request:", airdropCommand);
        const botResponse: Message = {
          content: `Processing airdrop request for ${airdropCommand.amount} ${airdropCommand.token}...`,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, botResponse]);

        // Detailed network logging and handling
        console.log("🌐 Current network:", wallet.network);
        console.log("🆔 Current Chain ID:", wallet.chainId);

        // Check network and switch if needed
        if (wallet.network !== 'sepolia' && wallet.chainId !== '11155111') {
          console.log("🔄 Switching to Sepolia Network");
          const switchingMessage: Message = {
            content: "You need to be on the Sepolia testnet to request an airdrop. I'll help you switch networks.",
            isBot: true,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, switchingMessage]);
          
          const switched = await switchToSepoliaNetwork();
          console.log("✅ Network switch result:", switched);
          
          if (!switched) {
            const errorMessage: Message = {
              content: "Failed to switch to the Sepolia testnet. Please switch manually in your wallet and try again.",
              isBot: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            setMessages(prev => [...prev, errorMessage]);
            setProcessingCommand(false);
            return;
          }
        }
        
        // Process the airdrop
        console.log("💰 Requesting airdrop:", { token: airdropCommand.token, amount: airdropCommand.amount });
        const result = await requestAirdrop(airdropCommand.token, airdropCommand.amount);
        console.log("🎉 Airdrop result:", result);
        
        const resultMessage: Message = {
          content: result 
            ? `Successfully initiated airdrop request for ${airdropCommand.amount} ${airdropCommand.token} to your wallet. The faucet page has been opened in a new tab. Complete the process there to receive your testnet tokens.` 
            : `There was an issue with the airdrop request. Please make sure you're on the Sepolia testnet and try again.`,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages(prev => [...prev, resultMessage]);
      } else if (swapCommand && wallet) {
        const botResponse: Message = {
          content: `I'll help you swap ${swapCommand.amount} ${swapCommand.fromToken} to ${swapCommand.toToken}.`,
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
          component: 'swap'
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Generate AI response for regular messages
        // First, show a typing indicator
        const typingMessage: Message = {
          content: "...",
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages(prev => [...prev, typingMessage]);
        
        try {
          // Only send the last 10 messages for context to avoid token limits
          const recentMessages = messages.slice(-10);
          const aiResponse = await generateAIResponse(userInput, recentMessages);
          
          // Replace typing indicator with the actual response
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              content: aiResponse,
              isBot: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            return newMessages;
          });
        } catch (error: any) {
          console.error('AI response error:', error);
          
          // Replace typing indicator with error message
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              content: "I'm sorry, I had trouble generating a response. Please try asking again.",
              isBot: true,
              timestamp: new Date().toLocaleTimeString(),
            };
            return newMessages;
          });
          
          toast.error('Failed to generate response: ' + (error.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('🚨 Chat error:', error);
      
      const errorMessage: Message = {
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessingCommand(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark">
      <ScrollArea className="flex-1 p-4 bg-chat-gradient" ref={scrollRef}>
        <div className="space-y-4">
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
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-dark-subtle bg-dark">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={processingCommand ? "Processing..." : "Type your message..."}
            className="bg-dark-subtle border-dark-subtle text-white"
            disabled={processingCommand}
          />
          <Button 
            onClick={handleSend} 
            className="bg-green-500 hover:bg-green-600" 
            disabled={processingCommand || !input.trim()}
          >
            {processingCommand ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
