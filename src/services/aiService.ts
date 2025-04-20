
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";

export const generateAIResponse = async (message: string, chatHistory: Message[] = []): Promise<string> => {
  try {
    console.log("Generating AI response for:", message);
    console.log("Chat history length:", chatHistory.length);
    
    // Add a loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { 
        message, 
        chatHistory: chatHistory.slice(-10) // Only send the last 10 messages to avoid token limits
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`API error: ${error.message || 'Unknown error'}`);
    }
    
    if (!data?.content) {
      console.error('No response content:', data);
      throw new Error('No response received from AI. Please try again.');
    }
    
    console.log('AI response received:', data.content.slice(0, 100) + '...');
    return data.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};
