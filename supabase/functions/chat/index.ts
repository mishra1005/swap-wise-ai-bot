
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, chatHistory = [] } = await req.json()
    
    if (!message || typeof message !== 'string') {
      console.error('Invalid message:', message);
      return new Response(
        JSON.stringify({ error: 'A valid message is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error: Missing API key'
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Processing request: "${message.substring(0, 50)}..." with ${chatHistory.length} previous messages`);
    
    // Format the chat history for Gemini
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Create system prompt
    const systemPrompt = {
      role: 'system',
      parts: [{ text: 'You are a helpful assistant that specializes in cryptocurrency and DeFi topics. Keep responses concise and focused on helping users with their crypto-related questions. Analyze market trends, explain blockchain concepts, and offer insights about trading and investing in crypto assets. You are also knowledgeable about Web3, NFTs, and blockchain development. You can help users understand the Sepolia testnet and how to use it for development. Always respond to user messages and never ignore questions.' }]
    };

    // Build contents array with system prompt first
    const contents = [systemPrompt, ...formattedHistory];
    
    // Add user message last
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    console.log(`Making request to Gemini API with ${contents.length} messages`);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      let errorMessage = 'Failed to generate AI response';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += `: ${errorData?.error?.message || response.statusText}`;
      } catch {
        errorMessage += `: ${response.statusText}`;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    
    // Error handling for various response formats
    if (!data || !data.candidates || data.candidates.length === 0) {
      console.error('Empty response from Gemini API:', data);
      return new Response(
        JSON.stringify({ error: 'No response generated from AI' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!data.candidates[0].content) {
      console.error('Missing content in API response:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from Gemini API' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
      console.error('Missing content parts in API response:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid content format from Gemini API' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const aiResponse = data.candidates[0].content.parts[0].text;

    if (!aiResponse) {
      console.error('Empty text in API response:', data);
      return new Response(
        JSON.stringify({ error: 'Empty response from Gemini API' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Generated response (${aiResponse.length} chars): "${aiResponse.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ content: aiResponse }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})
