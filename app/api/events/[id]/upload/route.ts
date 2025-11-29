import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, checkEventAccess, hasPermission } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = await checkEventAccess(user.id, eventId);
    if (!hasPermission(userRole, 'MANAGER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not supported. Please upload a PDF or TXT file.' 
      }, { status: 400 });
    }

    // Look up the category ID from the categories table
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('label', category)
      .single();

    if (categoryError || !categoryData) {
      console.error('Category lookup error:', categoryError);
      return NextResponse.json({ 
        error: 'Invalid category. Please select a valid category.' 
      }, { status: 400 });
    }

    const BUCKET = 'event-files';
    const filePath = `event/${eventId}/${Date.now()}_${file.name}`;

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
      return NextResponse.json({ 
        error: 'Failed to upload file to storage', 
        details: uploadError 
      }, { status: 500 });
    }

    const { data: fileRecord, error: dbError } = await supabase
      .from('event_files')
      .insert({
        event_id: eventId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        category_id: categoryData.id,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Intentar eliminar archivo de storage si falla la BD
      await supabase.storage.from(BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save file metadata', details: dbError },
        { status: 500 }
      );
    }

    const expiresInSeconds = 60 * 60;
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
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error processing file upload' }, { status: 500 });
  }
}
