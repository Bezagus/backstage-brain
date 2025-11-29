import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getCurrentUser, checkEventAccess } from '@/lib/auth';

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }
    return result;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const systemInstruction = `
Eres un especialista en extracción de datos de eventos.
Tu tarea es analizar los documentos del evento y extraer un cronograma (timeline) detallado.

Instrucciones:
1. Identifica todos los eventos con horario.
2. Agrupa los eventos en categorías lógicas (ej: "General", "Escenario Principal", "Catering", "VIP", "Técnico"). Si no hay una categoría clara, usa "General".
3. Extrae la fecha y hora combinadas (ej: "30 Nov - 14:00") y la etiqueta del evento.
4. Tu respuesta debe seguir estrictamente el esquema JSON proporcionado.
`;

const timelineSchema = {
    type: SchemaType.OBJECT,
    properties: {
        data: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    category: { type: SchemaType.STRING, description: "Categoría del grupo de eventos (ej: Main Stage, General)" },
                    items: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                date: { type: SchemaType.STRING, description: "Formato legible, ej: 14:00 o 30 Nov 14:00" },
                                label: { type: SchemaType.STRING, description: "Nombre o descripción corta del evento" }
                            },
                            required: ["date", "label"]
                        }
                    }
                },
                required: ["category", "items"]
            }
        }
    },
    required: ["data"]
};

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025",
    systemInstruction: systemInstruction,
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        // 1. Authentication & Authorization
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userRole = await checkEventAccess(user.id, eventId);
        if (!userRole) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // 2. Fetch file list from the database
        const { data: files, error: dbError } = await supabase
            .from('event_files')
            .select('file_path, file_name')
            .eq('event_id', eventId);

        if (dbError) {
            console.error('Supabase DB error:', dbError);
            return NextResponse.json({ error: 'Failed to query files for the event' }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No documents found for this event to generate a timeline." }, { status: 404 });
        }

        // 3. Download and read file content
        let context = '';
        for (const file of files) {
            const { data: blob, error: downloadError } = await supabase.storage
                .from('event-files')
                .download(file.file_path);

            if (downloadError) {
                console.warn(`Failed to download ${file.file_name}:`, downloadError.message);
                continue;
            }

            if (blob) {
                const fileContent = await streamToString(blob.stream());
                context += `\n\n--- Document: ${file.file_name} ---\n${fileContent}`;
            }
        }

        if (!context) {
            return NextResponse.json({ error: 'Could not read content from any of the event files.' }, { status: 500 });
        }

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            console.error("Error parsing JSON from Gemini:", e);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error('Timeline Generation API error:', error);
        if (error instanceof Error && error.message.includes('GoogleGenerativeAI')) {
            return NextResponse.json({ error: 'Failed to generate timeline from AI model.', details: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}