// Database types for Backstage Brain

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'
export type TimelineEntryType = 'rehearsal' | 'soundcheck' | 'logistics' | 'show' | 'meeting'
export type FileCategory = 'Horarios' | 'Técnica' | 'Legales' | 'Personal' | 'Marketing'
export type MessageRole = 'user' | 'assistant'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  date: string
  location: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
  is_archived: boolean
}

export interface EventUser {
  id: string
  event_id: string
  user_id: string
  role: UserRole
  added_by: string | null
  added_at: string
}

export interface TimelineEntry {
  id: string
  event_id: string
  time: string
  description: string
  type: TimelineEntryType
  location: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EventFile {
  id: string
  event_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  category: FileCategory
  uploaded_by: string | null
  uploaded_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: MessageRole
  content: string
  source_file_id: string | null
  source_document_name: string | null
  created_at: string
  file_id?: string;
  event_files?: {
    file_name: string;
  };
}
