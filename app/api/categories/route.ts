import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        // 1. Authentication
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch categories from the database
        const { data: categories, error: dbError } = await supabase
            .from('categories')
            .select('*');

        if (dbError) {
            console.error('Supabase DB error:', dbError);
            return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
        }

        return NextResponse.json(categories);

    } catch (error) {
        console.error('Categories API error:', error);
        if (error instanceof Error && error.message.includes('Authentication')) {
             return NextResponse.json({ error: 'Authentication failed.', details: error.message }, { status: 401 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}

