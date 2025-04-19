
export const generateBotResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('swap')) {
    return "I'll help you swap your tokens. Please specify the amount and tokens you'd like to swap (e.g., 'Swap 0.5 ETH to USDC')";
  }
  
  if (lowerMsg.includes('history') || lowerMsg.includes('transactions')) {
    return "Here are your recent transactions.";
  }
  
  if (lowerMsg.includes('help')) {
    return "I can help you with: \n- Swapping tokens (e.g., 'Swap 0.5 ETH to USDC')\n- Viewing transaction history ('Show my transactions')\n- Checking token prices ('Price of ETH')";
  }
  
  return "I'm here to help you swap cryptocurrencies. What would you like to do?";
};
