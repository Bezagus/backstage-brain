import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// GET - Obtener historial de chat del usuario
export async function GET(req: NextRequest) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Obtener mensajes del usuario
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        event_files(file_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chat messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error in chat GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Enviar mensaje
export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validar mensaje
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 3. Guardar mensaje del usuario
    const { data: userMessage, error: userError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message.trim()
      })
      .select()
      .single()

    if (userError) {
      console.error('Error saving user message:', userError)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // 4. Generar respuesta (hardcoded por ahora, AI se agregará después)
    const assistantResponse = `He recibido tu mensaje: "${message}". La integración con AI estará disponible pronto.`

    // 5. Guardar respuesta del asistente
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        role: 'assistant',
        content: assistantResponse
      })
      .select()
      .single()

    if (assistantError) {
      console.error('Error saving assistant message:', assistantError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    return NextResponse.json({
      userMessage,
      assistantMessage,
      response: assistantResponse
    })
  } catch (error) {
    console.error('Error in chat POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

