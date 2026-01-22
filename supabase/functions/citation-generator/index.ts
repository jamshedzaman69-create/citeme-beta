import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  text: string;
  format: string;
  sampleSize?: string;
  dateRange?: string;
  location?: string;
  parameters?: string;
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

    const { text, format, sampleSize, dateRange, location, parameters }: RequestBody = await req.json();

    if (!text || !format) {
      throw new Error('Missing required fields: text and format');
    }

    let prompt = `You are an academic research assistant. Generate a realistic academic citation based on the following request:\n\nTopic: ${text}\nCitation Format: ${format}`;

    if (sampleSize) prompt += `\nSample Size: ${sampleSize}`;
    if (dateRange) prompt += `\nDate Range: ${dateRange}`;
    if (location) prompt += `\nLocation: ${location}`;
    if (parameters) prompt += `\nAdditional Parameters: ${parameters}`;

    prompt += `\n\nProvide the response as a JSON object with the following fields:
- studyFindings: A brief description of what the study found (2-3 sentences)
- citation: The author(s), year, and title of the study
- briefDescription: A one-sentence description of the study methodology
- location: Where the study was conducted
- date: Year or date range of the study
- participants: Number and type of participants
- accessibility: Where the study can be accessed (journal name, DOI, etc.)
- link: A realistic-looking DOI link or journal URL (use actual journal URLs if possible)
- formattedCitation: The complete citation in the requested ${format} format with proper HTML formatting (use <i> for italics, <b> for bold)

Ensure the citation is realistic, academically credible, and follows ${format} formatting guidelines precisely.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an academic research assistant that generates realistic and credible academic citations. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content?.trim() || '';

    let result;
    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in citation-generator function:', error);
    
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