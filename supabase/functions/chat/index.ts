
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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    // Format the chat history for Gemini
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'You are a helpful assistant that specializes in cryptocurrency and DeFi topics. Keep responses concise and focused on helping users with their crypto-related questions. Analyze market trends, explain blockchain concepts, and offer insights about trading and investing in crypto assets.' }]
          },
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', errorData)
      throw new Error(`Failed to generate AI response: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ content: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
