
export const generateBotResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('swap')) {
    return "I'll help you swap your tokens. Please specify the amount and tokens you'd like to swap (e.g., 'Swap 0.5 ETH to USDC')";
  }
  
  if (lowerMsg.includes('history') || lowerMsg.includes('transactions')) {
    return "Here are your recent transactions.";
  }
  
  if (lowerMsg.includes('airdrop')) {
    return "I can help you request an airdrop on the testnet. The airdrop will be processed shortly.";
  }
  
  if (lowerMsg.includes('help')) {
    return "I can help you with: \n- Swapping tokens (e.g., 'Swap 0.5 ETH to USDC')\n- Viewing transaction history ('Show my transactions')\n- Requesting airdrops ('Request airdrop')\n- Checking token prices ('Price of ETH')";
  }
  
  return "I'm here to help you swap cryptocurrencies. What would you like to do?";
};

export const parseAirdropCommand = (message: string): { token: string, amount: string } | null => {
  const lowerMsg = message.toLowerCase();
  
  // Check for airdrop request pattern
  if (lowerMsg.includes('airdrop')) {
    // Try to extract token and amount
    const tokenMatch = /airdrop\s+(?:of\s+)?(\d+(?:\.\d+)?)\s+([a-z]+)/i.exec(message);
    if (tokenMatch) {
      return {
        amount: tokenMatch[1],
        token: tokenMatch[2].toUpperCase(),
      };
    }
    
    // Match just token without amount
    const tokenOnlyMatch = /airdrop\s+([a-z]+)/i.exec(message);
    if (tokenOnlyMatch) {
      return {
        token: tokenOnlyMatch[1].toUpperCase(),
        amount: '1',
      };
    }
    
    // Default values if no specific token/amount mentioned
    return {
      token: 'ETH',
      amount: '1'
    };
  }
  
  return null;
};

export const parseSwapCommand = (message: string): { fromToken: string, toToken: string, amount: string } | null => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('swap')) {
    // Match pattern like "swap 0.5 ETH to USDC"
    const swapMatch = /swap\s+(\d+(?:\.\d+)?)\s+([a-z]+)\s+(?:to|for)\s+([a-z]+)/i.exec(message);
    
    if (swapMatch) {
      return {
        amount: swapMatch[1],
        fromToken: swapMatch[2].toUpperCase(),
        toToken: swapMatch[3].toUpperCase()
      };
    }
  }
  
  return null;
};
