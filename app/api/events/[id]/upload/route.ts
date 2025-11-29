import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `File type not supported. Please upload a PDF or TXT file.` }, { status: 400 });
    }

    const filePath = `${eventId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('event-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to Supabase' }, { status: 500 });
    }

    const { data } = supabase
      .storage
      .from('event-files')
      .getPublicUrl(filePath);

    return NextResponse.json({
      message: 'File uploaded successfully',
      publicUrl: data.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error processing file upload' }, { status: 500 });
  }
}

