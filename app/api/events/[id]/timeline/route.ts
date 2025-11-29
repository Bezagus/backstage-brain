import { NextRequest, NextResponse } from 'next/server';

const timeline = [
  { time: '2025-12-15T08:00:00Z', description: 'Artist Arrival' },
  { time: '2025-12-15T09:00:00Z', description: 'Soundcheck' },
  { time: '2025-12-15T09:30:00Z', description: 'Doors Open' },
  { time: '2025-12-15T10:00:00Z', description: 'Opening Act' },
  { time: '2025-12-15T11:00:00Z', description: 'Main Artist Performance' },
  { time: '2025-12-15T13:00:00Z', description: 'Event End' },
];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log(`Fetching timeline for event ID: ${params.id}`);

  return NextResponse.json({ timeline });
}
