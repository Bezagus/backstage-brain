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

export async function PUT(
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

    // 2. Verificar acceso al evento (solo ADMIN o MANAGER pueden editar)
    const userRole = await checkEventAccess(user.id, id)
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'MANAGER')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 3. Obtener datos del body
    const body = await req.json()
    const { name, date, location, description } = body

    if (!name?.trim() || !date || !location?.trim()) {
      return NextResponse.json({ error: 'Name, date, and location are required' }, { status: 400 })
    }

    // 4. Actualizar evento
    const { data: event, error } = await supabase
      .from('events')
      .update({
        name: name.trim(),
        date,
        location: location.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_archived', false)
      .select()
      .single()

    if (error || !event) {
      console.error('Error updating event:', error)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({
      event: {
        ...event,
        userRole
      }
    })
  } catch (error) {
    console.error('Error in event PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    // 2. Verificar acceso al evento (solo ADMIN puede eliminar)
    const userRole = await checkEventAccess(user.id, id)
    if (!userRole || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete events' }, { status: 403 })
    }

    // 3. Soft delete (archivar el evento en lugar de eliminarlo)
    const { error } = await supabase
      .from('events')
      .update({
        is_archived: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in event DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

