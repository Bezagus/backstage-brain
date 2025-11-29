import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:');
    console.log('Name:', file.name);
    console.log('Type:', file.type);
    console.log('Size:', file.size, 'bytes');

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `File type not supported. Please upload a PDF or TXT file.` }, { status: 400 });
    }

    return NextResponse.json({
      message: 'File uploaded successfully (hardcoded response)',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error processing file upload' }, { status: 500 });
  }
}

