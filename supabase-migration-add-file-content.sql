-- ============================================================================
-- MIGRATION: Add file_content column for caching
-- ============================================================================

-- Add file_content column to event_files table
ALTER TABLE event_files
ADD COLUMN file_content TEXT;

-- Create index for faster queries
CREATE INDEX idx_event_files_content ON event_files(event_id) WHERE file_content IS NOT NULL;

-- ============================================================================
-- MIGRATION COMPLETED
-- Execute this in Supabase SQL Editor
-- ============================================================================
