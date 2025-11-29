import { NextResponse } from 'next/server';

export async function GET() {
  const events = [
    {
      id: 1,
      name: 'Tech Conference 2025',
      date: '2025-12-15T10:00:00Z',
      location: 'San Francisco, CA',
      description: 'A conference about the future of technology.',
    },
    {
      id: 2,
      name: 'Design Summit',
      date: '2026-01-20T09:00:00Z',
      location: 'New York, NY',
      description: 'A summit for designers and creative professionals.',
    },
    {
      id: 3,
      name: 'AI Workshop',
      date: '2026-02-10T14:00:00Z',
      location: 'Online',
      description: 'A hands-on workshop on artificial intelligence.',
    },
  ];

  return NextResponse.json({ events });
}

