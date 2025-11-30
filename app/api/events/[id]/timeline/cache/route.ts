import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, checkEventAccess } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    // Auth & access control
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = await checkEventAccess(user.id, eventId);
    if (!userRole) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { count: filesCount, error: filesError } = await supabase
      .from('event_files')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (filesError) {
      console.error('Error checking event files for cached timeline:', filesError);
      return NextResponse.json({ error: 'Failed to verify event files for timeline' }, { status: 500 });
    }
    if (!filesCount || filesCount === 0) {
      return NextResponse.json({ error: 'No documents found for this event to provide a cached timeline' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('event_timelines')
      .select('timeline_json, updated_at')
      .eq('event_id', eventId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'No cached timeline found for this event' }, { status: 404 });
      }
      console.error('Error fetching cached timeline:', error);
      return NextResponse.json({ error: 'Failed to fetch cached timeline' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'No cached timeline found for this event' }, { status: 404 });
    }

    return NextResponse.json({
      event_id: eventId,
      timeline: data.timeline_json,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.error('Timeline cache fetch error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
