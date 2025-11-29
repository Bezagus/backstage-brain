import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    let user;

    const { id: eventId } = await params;



    try {
        user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized: No user found' }, { status: 401 });
    } catch (err) {
        console.error('Authentication error:', err);
        return NextResponse.json({ error: 'Unauthorized: Invalid token or authentication error' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'File type not supported. Please upload a PDF or TXT file.' }, { status: 400 });
    }

    const BUCKET = 'event-files';
    const TABLE = 'event_files';

    const filePath = `event/${eventId}/${Date.now()}_${file.name}`;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, fileData, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload file to storage', details: uploadError }, { status: 500 });
        }

        const { data: fileRecord, error: dbError } = await supabase
            .from(TABLE)
            .insert({
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type,
                uploaded_by: user.id,
                event_id: eventId,
                category_id: category
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error on insert:', dbError);
            // cleanup uploaded file
            await supabase.storage.from(BUCKET).remove([filePath]);
            return NextResponse.json({ error: 'Failed to save file metadata', details: dbError }, { status: 500 });
        }

        const expiresInSeconds = 60 * 60; // 1 hour
        const { data: signed, error: signError } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(filePath, expiresInSeconds);

        if (signError) {
            console.warn('createSignedUrl failed, falling back to getPublicUrl:', signError);
            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
            return NextResponse.json({
                message: 'File uploaded successfully',
                file: fileRecord,
                publicUrl: pub.publicUrl
            });
        }

        return NextResponse.json({
            message: 'File uploaded successfully',
            file: fileRecord,
            // @ts-expect-error
            signedUrl: signed.signedURL
        });
    } catch (err) {
        console.error('Unexpected server error:', err);
        return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
    }
}