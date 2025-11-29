import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error('Supabase login error:', loginError.message);
      return NextResponse.json({ error: loginError.message }, { status: 400 });
    }

    if (!sessionData.user) {
        return NextResponse.json({ error: 'Login failed, user not found' }, { status: 500 });
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('event_id, role')
      .eq('user_id', sessionData.user.id);

    if (rolesError) {
        console.error('Error fetching user roles:', rolesError.message);
    }

    return NextResponse.json({
        ...sessionData,
        user: {
            ...sessionData.user,
            roles: roles || []
        }
    });
  } catch (error) {
    console.error('Login route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Invalid request: ${errorMessage}` }, { status: 400 });
  }
}

