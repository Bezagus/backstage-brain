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

// CAMBIO 2: Definir params como una Promesa (Next.js 15)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // CAMBIO 3: Desempaquetar params con await
        const { id: eventId } = await params;

        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Contexto del evento (Hardcoded por ahora, preparado para ser dinámico)
        const context = `
    DOCUMENTO: RIDER TÉCNICO Y HOSPITALITY
    ARTISTA: LOS ALGORITMOS
    EVENTO: HACKATHON FEST 2025
    FECHA: 30 DE NOVIEMBRE 2025
    VERSIÓN: FINAL V1

    ---

    1. CONTACTOS DE PRODUCCIÓN
    --------------------------
    Tour Manager: Ana "Loop" García
    Teléfono: +54 9 11 1234 5678
    Email: ana@losalgoritmos.band

    Ingeniero de Sonido (FOH): Beto "Bass" Méndez
    Teléfono: +54 9 11 8765 4321

    2. CRONOGRAMA (RUN OF SHOW)
    ---------------------------
    IMPORTANTE: Los horarios son estrictos. Cualquier retraso debe ser notificado al Stage Manager.

    14:00 - Carga de equipos (Load-in)
    15:00 - Armado de Backline
    16:30 - Prueba de Sonido (Soundcheck) - Duración: 60 min
    19:30 - Apertura de Puertas (Doors Open)
    21:00 - Banda Soporte
    22:15 - SHOW LOS ALGORITMOS (90 min)
    00:00 - Desarme

    3. REQUERIMIENTOS TÉCNICOS (AUDIO)
    ----------------------------------
    El sistema de PA debe ser capaz de cubrir toda la audiencia con 110dB SPL sin distorsión.

    CONSOLA FOH:
    Preferimos: Midas M32 o Yamaha CL5.
    NO aceptamos: Consolas analógicas ni Behringer X32 (salvo emergencia).

    ENERGÍA ELÉCTRICA:
    Escenario: Necesitamos 4 tomas de corriente de 220V (Trifásica no necesaria, pero sí tierra real).
    Posición de FOH: 1 toma de 220V exclusiva para la consola.

    INPUT LIST (LISTA DE CANALES):
    1. Kick (Micro: Shure Beta 52)
    2. Snare (Micro: Shure SM57)
    3. Hi-Hat
    4. Bajo (Línea / DI Box)
    5. Guitarra Eléctrica (Micro: Sennheiser e906)
    6. Teclados L (DI Box)
    7. Teclados R (DI Box)
    8. Voz Principal (Micro: Shure SM58 - Trae el suyo propio)
    9. Coros (Micro: Shure SM58)

    4. HOSPITALITY Y CATERING (CAMERINOS)
    -------------------------------------
    El camerino debe estar disponible desde las 14:00hs. Debe tener llave, espejo y buena iluminación.

    CENA (Para 6 personas - A las 20:00hs):
    - 4 Menús con opción de carne/pollo.
    - 2 Menús VEGANOS estrictos (Sin lácteos, sin huevo). Alérgicos al maní.

    BEBIDAS EN CAMERINO:
    - 12 Botellas de agua mineral sin gas (Temperatura ambiente).
    - 6 Latas de bebida energizante.
    - 1 Botella de Whisky (Marca preferida: Blue Label o similar).
    - Café y té disponible todo el día.

    NOTAS ADICIONALES:
    El bajista llega tarde por vuelo, se presentará directamente a la prueba de sonido a las 16:45. Por favor tener su equipo listo.
    `;

        /* BLOQUE SUPABASE COMENTADO (Mantener comentado como en tu original) */
        /*
        const { data: files, error: listError } = await supabase.storage
          .from('event-files')
          .list(eventId);

        if (listError) {
          console.error('Supabase list error:', listError);
          return NextResponse.json({ error: 'Failed to list files from Supabase' }, { status: 500 });
        }

        if (!files || files.length === 0) {
          return NextResponse.json({ response: "I couldn't find any documents for this event. Please upload some files first." });
        }

        let context = '';
        for (const file of files) {
          const { data: blob, error: downloadError } = await supabase.storage
            .from('event-files')
            .download(`${eventId}/${file.name}`);

          if (downloadError) {
            console.error(`Failed to download ${file.name}:`, downloadError);
            continue; // Skip this file and try the next one
          }

          if (blob) {
            const fileContent = await streamToString(blob.stream());
            context += `\n\n--- Content from ${file.name} ---\n${fileContent}`;
          }
        }

        if (!context) {
            return NextResponse.json({ error: 'Could not read content from any of the event files.' }, { status: 500 });
        }
        */

        // CAMBIO: Prompt simplificado.
        // Ya no necesitamos repetirle quién es, porque eso está en el systemInstruction.
        // Solo le pasamos los datos y la pregunta.
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