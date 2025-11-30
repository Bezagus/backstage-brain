import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
5. quiero que siempre lo devuelvas de la misma forma todo dentro de timelines: []
6. dentro de timelines quiero que pongas la categoria como una key y los items.
7. ejemplo {timelines: [{category:"", items:[{label:"", date: ""}]}]}
`;


const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025",
    systemInstruction: systemInstruction,
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function GET(
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

        const { data: files, error: dbError } = await supabase
            .from('event_files')
            .select('file_path, file_name')
            .eq('event_id', eventId);

        if (dbError) {
            console.error('Supabase DB error:', dbError);
            return NextResponse.json({ error: 'Failed to query files for the event' }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No documents found for this event to generate a timeline.' }, { status: 404 });
        }

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

        let parsedData: unknown;
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            console.error('Error parsing JSON from Gemini:', e);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        const { error: deleteError } = await supabase
          .from('event_timelines')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) {
          console.error('Failed to delete existing timeline:', deleteError);
          return NextResponse.json({ error: 'Failed to clear previous timeline cache' }, { status: 500 });
        }

        const { error: cacheError } = await supabase
          .from('event_timelines')
          .insert({
            event_id: eventId,
            timeline_json: parsedData,
            updated_at: new Date().toISOString(),
          });

        if (cacheError) {
          console.error('Failed to cache timeline:', cacheError);
          return NextResponse.json({ error: 'Failed to cache generated timeline' }, { status: 500 });
        }

        return NextResponse.json({
          status: 'ok',
          message: 'Timeline generated and cached successfully',
        });

    } catch (error) {
        console.error('Timeline Generation API error:', error);
        if (error instanceof Error && error.message.includes('GoogleGenerativeAI')) {
            return NextResponse.json({ error: 'Failed to generate timeline from AI model.', details: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}