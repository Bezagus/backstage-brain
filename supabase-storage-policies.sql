-- ============================================================================
-- BACKSTAGE BRAIN - STORAGE POLICIES MIGRATION
-- Políticas de Storage para el bucket event-files
-- Ejecutar en Supabase SQL Editor después de crear el bucket 'event-files'
-- ============================================================================

-- IMPORTANTE: Asegúrate de que el bucket 'event-files' existe antes de ejecutar este script
-- Puedes crearlo manualmente en: Supabase Dashboard > Storage > Create Bucket

-- ============================================================================
-- POLÍTICAS DE STORAGE PARA event-files
-- ============================================================================

-- Habilitar RLS en el bucket (si no está habilitado)
-- Nota: Esto se hace automáticamente al crear políticas, pero lo incluimos por claridad

-- Política INSERT: Permitir subir archivos a cualquier usuario (autenticado o no)
CREATE POLICY "Allow public INSERT on event-files"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'event-files'
);

-- Política SELECT: Permitir leer/descargar archivos a cualquier usuario (autenticado o no)
CREATE POLICY "Allow public SELECT on event-files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'event-files'
);

-- Política UPDATE: Permitir actualizar archivos a cualquier usuario (autenticado o no)
CREATE POLICY "Allow public UPDATE on event-files"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'event-files'
)
WITH CHECK (
  bucket_id = 'event-files'
);

-- Política DELETE: Permitir eliminar archivos a cualquier usuario (autenticado o no)
CREATE POLICY "Allow public DELETE on event-files"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'event-files'
);

-- ============================================================================
-- MIGRACIÓN COMPLETADA
-- ============================================================================
-- 
-- Estas políticas permiten:
-- - Cualquier usuario (autenticado o no) puede subir archivos
-- - Cualquier usuario (autenticado o no) puede leer/descargar archivos
-- - Cualquier usuario (autenticado o no) puede actualizar archivos
-- - Cualquier usuario (autenticado o no) puede eliminar archivos
-- - Sin restricciones de tipo de archivo (MIME type)
-- - Sin restricciones de path dentro del bucket
--
-- NOTA DE SEGURIDAD: Estas políticas permiten acceso público completo al bucket.
-- Si necesitas restringir el acceso en el futuro, modifica o elimina estas políticas.
-- ============================================================================

