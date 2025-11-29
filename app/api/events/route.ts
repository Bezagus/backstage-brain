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

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: unknown
    try {
      payload = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, date, location, description } = (payload || {}) as Record<string, unknown>

    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const trimmedLocation = typeof location === 'string' ? location.trim() : ''
    const descriptionValue =
      typeof description === 'string' && description.trim().length > 0
        ? description.trim()
        : null
    const dateValue = typeof date === 'string' ? date : ''

    if (!trimmedName || !trimmedLocation || !dateValue) {
      return NextResponse.json(
        { error: 'Nombre, fecha y ubicación son obligatorios' },
        { status: 400 }
      )
    }

    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 })
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        name: trimmedName,
        date: parsedDate.toISOString(),
        location: trimmedLocation,
        description: descriptionValue,
        created_by: user.id
      })
      .select('*')
      .single()

    if (error || !event) {
      console.error('Error creating event:', error)
      return NextResponse.json(
        { error: 'No se pudo crear el evento' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        event: {
          ...event,
          userRole: 'ADMIN'
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in events POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

