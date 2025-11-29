import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const systemInstruction = `
Rol: Eres "Backstage Brain", el asistente oficial del evento HACKATHON FEST 2025.
Misión: Responder preguntas de los usuarios basándote ÚNICAMENTE en el contexto proporcionado.

Reglas estrictas:
1. Tu fuente de verdad es el texto etiquetado como "CONTEXTO DEL EVENTO". No uses conocimiento externo.
2. Si la respuesta no está en el contexto, responde educadamente: "Solo puedo responder preguntas relacionadas con la información oficial de este evento."
3. Sé conciso, útil y mantén un tono profesional pero amigable.
4. Si te preguntan por temas ajenos al evento, recuérdales tu función.
5. No te presentes ni saludes. Ve directamente a la respuesta.
`;

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025",
    systemInstruction: systemInstruction
});

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        result += decoder.decode(value, { stream: true });
    }
    return result;
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id: eventId } =  params;

        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const { data: files, error: dbError } = await supabase
            .from('event_files')
            .select('file_path, file_name')
            .eq('event_id', eventId);

        if (dbError) {
            console.error('Supabase DB error:', dbError);
            return NextResponse.json({ error: 'Failed to query files for the event' }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ response: "I couldn't find any documents for this event. Please upload some files first." });
        }

        let context = '';
        for (const file of files) {
            const { data: blob, error: downloadError } = await supabase.storage
                .from('event-files')
                .download(file.file_path);

            if (downloadError) {
                console.error(`Failed to download ${file.file_name}:`, downloadError);
                continue;
            }

            if (blob) {
                const fileContent = await streamToString(blob.stream());
                context += `\n\n--- Content from ${file.file_name} ---\n${fileContent}`;
            }
        }

        if (!context) {
            return NextResponse.json({ error: 'Could not read content from any of the event files.' }, { status: 500 });
        }

        const prompt = `
    CONTEXTO DEL EVENTO:
    ${context}

    PREGUNTA DEL USUARIO:
    ${message}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
    }
}