import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, checkEventAccess, hasPermission } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 1. Autenticación
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verificar permisos (solo ADMIN y MANAGER pueden subir)
    const userRole = await checkEventAccess(user.id, id)
    if (!hasPermission(userRole, 'MANAGER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 3. Obtener archivo y categoría
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // 4. Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Please upload a PDF or TXT file.' },
        { status: 400 }
      )
    }

    // 5. Subir a Storage
    const filePath = `${id}/${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('event-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // 6. Guardar metadata en BD
    const { data: fileRecord, error: dbError } = await supabase
      .from('event_files')
      .insert({
        event_id: id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        category: category,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Intentar eliminar archivo de storage si falla la BD
      await supabase.storage.from('event-files').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      )
    }

    // 7. Obtener URL pública
    const { data } = supabase.storage
      .from('event-files')
      .getPublicUrl(filePath)

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: fileRecord,
      publicUrl: data.publicUrl
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error processing file upload' }, { status: 500 })
  }
}

