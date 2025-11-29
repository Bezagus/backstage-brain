import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, checkEventAccess } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from '@/lib/types';

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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        // 1. Authentication
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check event access
        const userRole = await checkEventAccess(user.id, eventId);
        if (!userRole) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // 3. Get event files to find related messages
        const { data: eventFiles, error: filesError } = await supabase
            .from('event_files')
            .select('id')
            .eq('event_id', eventId);

        if (filesError) {
            console.error('Error fetching event files:', filesError);
            return NextResponse.json({ error: 'Failed to fetch event files' }, { status: 500 });
        }

        const fileIds = eventFiles?.map(f => f.id) || [];

        // 4. Fetch chat messages linked to this event's files
        if (fileIds.length === 0) {
            // If no files, return empty array
            return NextResponse.json({ messages: [] });
        }

        const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .in('source_file_id', fileIds)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('Error fetching chat messages:', messagesError);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        // 5. Enrich messages with file information
        const enrichedMessages: ChatMessage[] = (messages || []).map((msg) => ({
            id: msg.id,
            user_id: msg.user_id,
            role: msg.role,
            content: msg.content,
            source_file_id: msg.source_file_id,
            source_document_name: msg.source_document_name,
            created_at: msg.created_at,
            file_id: msg.source_file_id || undefined,
            event_files: msg.source_document_name ? { file_name: msg.source_document_name } : undefined
        }));

        return NextResponse.json({ messages: enrichedMessages });
    } catch (error) {
        console.error('Chat API GET error:', error);
        return NextResponse.json({ error: 'An error occurred while fetching messages.' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        // 1. Authentication
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check event access
        const userRole = await checkEventAccess(user.id, eventId);
        if (!userRole) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 3. Get event files
        const { data: files, error: dbError } = await supabase
            .from('event_files')
            .select('id, file_path, file_name')
            .eq('event_id', eventId);

        if (dbError) {
            console.error('Supabase DB error:', dbError);
            return NextResponse.json({ error: 'Failed to query files for the event' }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ response: "I couldn't find any documents for this event. Please upload some files first." });
        }

        // 4. Build context from files
        let context = '';
        let firstFileId: string | null = null;
        let firstFileName: string | null = null;

        for (const file of files) {
            if (!firstFileId) {
                firstFileId = file.id;
                firstFileName = file.file_name;
            }

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

        // 5. Generate AI response
        const prompt = `
    CONTEXTO DEL EVENTO:
    ${context}

    PREGUNTA DEL USUARIO:
    ${message}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 6. Save user message to database
        const { data: userMessage, error: userMessageError } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                role: 'user',
                content: message,
                source_file_id: firstFileId,
                source_document_name: firstFileName
            })
            .select()
            .single();

        if (userMessageError) {
            console.error('Error saving user message:', userMessageError);
            // Continue even if saving fails
        }

        // 7. Save assistant message to database
        const { data: assistantMessage, error: assistantMessageError } = await supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                role: 'assistant',
                content: text,
                source_file_id: firstFileId,
                source_document_name: firstFileName
            })
            .select()
            .single();

        if (assistantMessageError) {
            console.error('Error saving assistant message:', assistantMessageError);
            // Continue even if saving fails
        }

        // 8. Format user message response
        const userMessageResponse: ChatMessage = userMessage ? {
            id: userMessage.id,
            user_id: userMessage.user_id,
            role: userMessage.role,
            content: userMessage.content,
            source_file_id: userMessage.source_file_id,
            source_document_name: userMessage.source_document_name,
            created_at: userMessage.created_at,
            file_id: userMessage.source_file_id || undefined,
            event_files: firstFileName ? { file_name: firstFileName } : undefined
        } : {
            id: '',
            user_id: user.id,
            role: 'user',
            content: message,
            source_file_id: firstFileId,
            source_document_name: firstFileName,
            created_at: new Date().toISOString()
        };

        // 9. Format assistant message response
        const assistantMessageResponse: ChatMessage = assistantMessage ? {
            id: assistantMessage.id,
            user_id: assistantMessage.user_id,
            role: assistantMessage.role,
            content: assistantMessage.content,
            source_file_id: assistantMessage.source_file_id,
            source_document_name: assistantMessage.source_document_name,
            created_at: assistantMessage.created_at,
            file_id: assistantMessage.source_file_id || undefined,
            event_files: assistantMessage.source_document_name ? { file_name: assistantMessage.source_document_name } : undefined
        } : {
            id: '',
            user_id: user.id,
            role: 'assistant',
            content: text,
            source_file_id: firstFileId,
            source_document_name: firstFileName,
            created_at: new Date().toISOString()
        };

        return NextResponse.json({
            userMessage: userMessageResponse,
            assistantMessage: assistantMessageResponse,
            response: text
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
    }
}