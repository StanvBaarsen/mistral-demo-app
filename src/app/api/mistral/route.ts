import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.API_KEY;
const client = new Mistral({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

		const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const chatStream = await client.chat.stream({
                    model: 'mistral-large-latest',
                    messages,
                    temperature: 0.2,
                });
                for await (const chunk of chatStream) {
					const chunkText = chunk.data.choices[0].delta.content || '';
					const encodedChunk = encoder.encode(chunkText);
					controller.enqueue(encodedChunk);
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: JSON.stringify(error) });
    }
}
