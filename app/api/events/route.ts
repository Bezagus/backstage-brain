import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Obtener parámetros de búsqueda
    const search = req.nextUrl.searchParams.get('search')

    // 3. Query base: eventos donde el usuario tiene acceso
    let query = supabase
      .from('events')
      .select(`
        *,
        event_users!inner(role)
      `)
      .eq('event_users.user_id', user.id)
      .eq('is_archived', false)
      .order('date', { ascending: true })

    // 4. Aplicar filtro de búsqueda si existe
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    // 5. Formatear respuesta con el rol del usuario
    const eventsWithRole = events.map(event => ({
      ...event,
      userRole: event.event_users[0]?.role
    }))

    return NextResponse.json({ events: eventsWithRole })
  } catch (error) {
    console.error('Error in events GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

