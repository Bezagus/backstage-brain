import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, checkEventAccess, hasPermission } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verificar acceso
    const userRole = await checkEventAccess(user.id, params.id)
    if (!userRole) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 3. Obtener timeline
    const { data: timeline, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('event_id', params.id)
      .order('time', { ascending: true })

    if (error) {
      console.error('Error fetching timeline:', error)
      return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
    }

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error('Error in timeline GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verificar permisos (solo ADMIN y MANAGER pueden crear)
    const userRole = await checkEventAccess(user.id, params.id)
    if (!hasPermission(userRole, 'MANAGER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 3. Validar datos
    const body = await req.json()
    const { time, description, type, location, notes } = body

    if (!time || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: time, description, type' },
        { status: 400 }
      )
    }

    // 4. Crear entrada de timeline
    const { data: entry, error } = await supabase
      .from('timeline_entries')
      .insert({
        event_id: params.id,
        time,
        description,
        type,
        location,
        notes,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating timeline entry:', error)
      return NextResponse.json({ error: 'Failed to create timeline entry' }, { status: 500 })
    }

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('Error in timeline POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
