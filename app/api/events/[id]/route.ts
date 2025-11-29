import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, checkEventAccess } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verificar acceso al evento
    const userRole = await checkEventAccess(user.id, id)
    if (!userRole) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 3. Obtener evento
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_archived', false)
      .single()

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 4. Retornar evento con rol del usuario
    return NextResponse.json({
      event: {
        ...event,
        userRole
      }
    })
  } catch (error) {
    console.error('Error in event GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

