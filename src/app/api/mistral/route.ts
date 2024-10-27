import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.API_KEY;
const client = new Mistral({ apiKey });

export async function POST(req: NextRequest) {
	try {
		const { messages } = await req.json();

		const chatResponse = await client.chat.complete({
			model: 'mistral-large-latest',
			messages,
			temperature: 0.2,
		});
		if(!chatResponse.choices || chatResponse.choices.length === 0) throw new Error('Empty response from Mistral');
		return NextResponse.json({ response: chatResponse.choices[0].message.content });
	} catch (error) {
		return NextResponse.json({ error: JSON.stringify(error) });
	}
}
