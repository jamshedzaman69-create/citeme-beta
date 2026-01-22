import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  action: 'improve' | 'grammar' | 'shorter' | 'longer' | 'translate' | 'summarize' | 'continue' | 'custom' | 'chat';
  text: string;
  customPrompt?: string;
  documentContext?: string;
  documentTitle?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, text, customPrompt, documentContext, documentTitle }: RequestBody = await req.json();

    if (!action) {
      throw new Error('Missing required field: action');
    }

    if (!text && action !== 'chat') {
      throw new Error('Missing required field: text');
    }

    let prompt = '';
    let systemPrompt = 'You are a helpful writing assistant. Always respond in English regardless of the input language. Follow instructions precisely and only return the requested content without any additional commentary or explanations.';

    switch (action) {
      case 'improve':
        prompt = `Improve the following text by enhancing flow, clarity, and professional tone. Keep the same meaning but make it more polished. Respond in English only:\n\n${text}`;
        break;

      case 'grammar':
        prompt = `Fix all grammar, spelling, punctuation, and typing errors in the following text. Do not change the content or style, only correct errors. Respond in English only:\n\n${text}`;
        break;

      case 'shorter':
        prompt = `Make the following text more concise while preserving all key information and meaning. Reduce wordiness and redundancy. Respond in English only:\n\n${text}`;
        break;

      case 'longer':
        prompt = `Expand the following text by adding relevant details, examples, or explanations. Make it more comprehensive while maintaining the original meaning. Respond in English only:\n\n${text}`;
        break;

      case 'translate':
        prompt = `Translate the following text to English. If it's already in English, confirm it's correct English:\n\n${text}`;
        break;

      case 'summarize':
        prompt = `Provide a clear, concise summary of the following text, capturing all main points. Respond in English only:\n\n${text}`;
        break;

      case 'continue':
        prompt = `Continue writing the following text in a natural and coherent way. Write 2-3 more sentences that flow naturally from the context. Respond in English only:\n\n${text}`;
        break;

      case 'custom':
        if (!customPrompt) {
          throw new Error('Custom prompt is required for custom action');
        }
        prompt = `${customPrompt}\n\nText: ${text}\n\nRespond in English only.`;
        break;

      case 'chat':
        systemPrompt = `You are Lex, a helpful AI writing assistant. You have access to the user's document titled "${documentTitle || 'Untitled'}" and can answer questions about it, provide feedback, suggest improvements, and help with writing. Be conversational, helpful, and specific in your responses.`;

        const contextPreview = documentContext
          ? (documentContext.length > 4000 ? documentContext.substring(0, 4000) + '...' : documentContext)
          : 'No document content available';

        prompt = `Document Context:\n${contextPreview}\n\nUser Question: ${text}\n\nProvide a helpful, conversational response based on the document context.`;
        break;

      default:
        throw new Error('Invalid action');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: action === 'grammar' ? 0.3 : 0.7,
        max_tokens: action === 'longer' || action === 'summarize' || action === 'chat' ? 1000 : 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({ result }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in ai-assist function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});