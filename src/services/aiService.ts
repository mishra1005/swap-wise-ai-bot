
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";

export const generateAIResponse = async (message: string, chatHistory: Message[] = []): Promise<string> => {
  try {
    console.log("Generating AI response for:", message);
    console.log("Chat history length:", chatHistory.length);
    
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message, chatHistory }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data?.content) {
      console.error('No response content:', data);
      throw new Error('No response content');
    }
    
    return data.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};
