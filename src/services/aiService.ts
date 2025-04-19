
import { supabase } from "@/integrations/supabase/client";

export const generateAIResponse = async (message: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message }
    });

    if (error) throw error;
    if (!data.content) throw new Error('No response content');
    
    return data.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};
