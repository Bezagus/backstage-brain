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

    // 2. Obtener todos los eventos del usuario
    const { data: eventUsers, error: eventUsersError } = await supabase
      .from('event_users')
      .select('event_id')
      .eq('user_id', user.id)

    if (eventUsersError) {
      console.error('Error fetching user events:', eventUsersError)
      return NextResponse.json({ error: 'Failed to fetch user events' }, { status: 500 })
    }

    const eventIds = eventUsers?.map(eu => eu.event_id) || []

    if (eventIds.length === 0) {
      return NextResponse.json({
        totalFiles: 0,
        filesToday: 0,
        lastUpdate: null,
        showsToday: 0
      })
    }

    // 3. Obtener total de archivos y archivos de hoy
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const { data: allFiles, error: filesError } = await supabase
      .from('event_files')
      .select('uploaded_at')
      .in('event_id', eventIds)

    if (filesError) {
      console.error('Error fetching files:', filesError)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    const totalFiles = allFiles?.length || 0
    const filesToday = allFiles?.filter(file => {
      const uploadedAt = new Date(file.uploaded_at)
      return uploadedAt >= todayStart && uploadedAt <= todayEnd
    }).length || 0

    // 4. Obtener última actualización (archivo más reciente)
    const { data: latestFile, error: latestFileError } = await supabase
      .from('event_files')
      .select('uploaded_at')
      .in('event_id', eventIds)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()

    let lastUpdate: string | null = null
    if (!latestFileError && latestFile) {
      lastUpdate = latestFile.uploaded_at
    }

    // 5. Obtener shows de hoy
    const todayStartISO = todayStart.toISOString()
    const todayEndISO = todayEnd.toISOString()

    const { data: showsToday, error: showsError } = await supabase
      .from('timeline_entries')
      .select('id')
      .in('event_id', eventIds)
      .eq('type', 'show')
      .gte('time', todayStartISO)
      .lte('time', todayEndISO)

    if (showsError) {
      console.error('Error fetching shows:', showsError)
      return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 })
    }

    return NextResponse.json({
      totalFiles,
      filesToday,
      lastUpdate,
      showsToday: showsToday?.length || 0
    })
  } catch (error) {
    console.error('Error in dashboard stats GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

