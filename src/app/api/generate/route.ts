import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

interface CerebrasChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            stage: 'code', 
            status: 'generating',
            message: 'Generating React component...'
          })}\n\n`));

          const codeResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-oss-120b',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert React developer. Generate a complete, production-ready React component.

CRITICAL REQUIREMENTS:
1. Use ONLY function syntax: function ComponentName() {}
2. Use React.useState, React.useEffect (with React. prefix)
3. Use Tailwind CSS for styling - beautiful gradients, shadows, animations
4. Component must be fully functional and interactive
5. NO imports, NO exports - just the function
6. Return ONLY the component code
7. Use semantic HTML and ARIA attributes
8. Add smooth transitions and hover effects
9. Make it responsive
10. Include error handling

Example:
function MyComponent() {
  const [count, setCount] = React.useState(0);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      <button onClick={() => setCount(count + 1)} className="px-4 py-2 bg-orange-600 text-white rounded-lg">
        Count: {count}
      </button>
    </div>
  );
}`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 1,
              max_completion_tokens: 65536,
              stream: true,
              top_p: 1
            })
          });

          if (!codeResponse.ok) {
            throw new Error(`Cerebras API error: ${codeResponse.status}`);
          }

          const reader = codeResponse.body?.getReader();
          const decoder = new TextDecoder();
          let fullCode = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
              
              for (const line of lines) {
                const data = line.replace('data: ', '').trim();
                if (data === '[DONE]') continue;
                
                try {
                  const parsed: CerebrasChunk = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content || '';
                  if (content) {
                    fullCode += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      stage: 'code', 
                      status: 'streaming',
                      content: content 
                    })}\n\n`));
                  }
                } catch (e) {}
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            stage: 'code', 
            status: 'complete',
            fullContent: fullCode
          })}\n\n`));

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            stage: 'test', 
            status: 'generating',
            message: 'Generating test suite...'
          })}\n\n`));

          const testResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-oss-120b',
              messages: [
                {
                  role: 'system',
                  content: 'Generate comprehensive Jest + React Testing Library tests. Test all functionality, edge cases, and accessibility. Return ONLY test code.'
                },
                {
                  role: 'user',
                  content: `Generate tests for:\n\n${fullCode}`
                }
              ],
              temperature: 1,
              max_completion_tokens: 65536,
              stream: true,
              top_p: 1
            })
          });

          const testReader = testResponse.body?.getReader();
          let fullTests = '';

          if (testReader) {
            while (true) {
              const { done, value } = await testReader.read();
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
              
              for (const line of lines) {
                const data = line.replace('data: ', '').trim();
                if (data === '[DONE]') continue;
                
                try {
                  const parsed: CerebrasChunk = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content || '';
                  if (content) {
                    fullTests += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      stage: 'test', 
                      status: 'streaming',
                      content: content 
                    })}\n\n`));
                  }
                } catch (e) {}
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            stage: 'test', 
            status: 'complete',
            fullContent: fullTests
          })}\n\n`));

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            stage: 'done',
            timestamp: new Date().toISOString()
          })}\n\n`));

          controller.close();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Generation failed';
          console.error('Generation error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            stage: 'error',
            error: message,
          })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
