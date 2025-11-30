import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, checkEventAccess, hasPermission } from '@/lib/auth';
import pdf from 'pdf-parse';

/**
 * Extract text content from file based on type
 */
async function extractFileContent(file: File, fileData: Uint8Array): Promise<string | null> {
  try {
    if (file.type === 'text/plain') {
      const text = new TextDecoder('utf-8').decode(fileData);
      return text;
    } else if (file.type === 'application/pdf') {
      const data = await pdf(Buffer.from(fileData));
      return data.text;
    }
    return null;
  } catch (error) {
    console.error('Error extracting file content:', error);
    return null;
  }
}

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

    // Extract file content for caching
    const fileContent = await extractFileContent(file, fileData);

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
        uploaded_by: user.id,
        file_content: fileContent
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

export async function DELETE(
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

    // 2. Get fileId from request body
    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const BUCKET = 'event-files';

    // 3. Fetch file path from DB
    const { data: file, error: fetchError } = await supabase
      .from('event_files')
      .select('file_path')
      .eq('id', fileId)
      .single();

    if (fetchError || !file) {
      console.error('Error fetching file for deletion:', fetchError);
      return NextResponse.json({ error: 'File not found or could not be fetched' }, { status: 404 });
    }

    // 4. Delete file from Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([file.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      return NextResponse.json({ error: 'Failed to delete file from storage' }, { status: 500 });
    }

    const { error: dbError } = await supabase
      .from('event_files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json({ error: 'Failed to delete file metadata from database' }, { status: 500 });
    }

    return NextResponse.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Error processing delete request' }, { status: 500 });
  }
}
