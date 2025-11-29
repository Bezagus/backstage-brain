-- ============================================================================
-- BACKSTAGE BRAIN - SCHEMA MIGRATION
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- 1. CREAR TIPOS ENUM
-- ============================================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'STAFF');
CREATE TYPE timeline_entry_type AS ENUM ('rehearsal', 'soundcheck', 'logistics', 'show', 'meeting');
CREATE TYPE file_category AS ENUM ('Horarios', 'Técnica', 'Legales', 'Personal', 'Marketing');
CREATE TYPE message_role AS ENUM ('user', 'assistant');


-- 2. CREAR TABLAS
-- ============================================================================

-- Tabla: profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla: event_users
CREATE TABLE event_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_event_user UNIQUE (event_id, user_id)
);

-- Tabla: timeline_entries
CREATE TABLE timeline_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    time TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    type timeline_entry_type NOT NULL,
    location TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: event_files
CREATE TABLE event_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    category file_category NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_file_path UNIQUE (file_path)
);

-- Tabla: chat_messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    source_file_id UUID REFERENCES event_files(id) ON DELETE SET NULL,
    source_document_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. CREAR ÍNDICES
-- ============================================================================

-- Índices para profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Índices para events
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_archived ON events(is_archived) WHERE is_archived = FALSE;

-- Índices para event_users
CREATE INDEX idx_event_users_event ON event_users(event_id);
CREATE INDEX idx_event_users_user ON event_users(user_id);
CREATE INDEX idx_event_users_event_user ON event_users(event_id, user_id);

-- Índices para timeline_entries
CREATE INDEX idx_timeline_event_time ON timeline_entries(event_id, time);
CREATE INDEX idx_timeline_type ON timeline_entries(type);

-- Índices para event_files
CREATE INDEX idx_event_files_event_category ON event_files(event_id, category);
CREATE INDEX idx_event_files_uploaded_at ON event_files(uploaded_at DESC);

-- Índices para chat_messages
CREATE INDEX idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);


-- 4. CREAR FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_entries_updated_at
    BEFORE UPDATE ON timeline_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para auto-crear profile al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear profile automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Función para auto-agregar creador como ADMIN al crear evento
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO event_users (event_id, user_id, role, added_by)
    VALUES (NEW.id, NEW.created_by, 'ADMIN', NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para agregar creador como admin
CREATE TRIGGER on_event_created
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_admin();


-- 5. FUNCIONES HELPER (OPCIONAL)
-- ============================================================================

-- Obtener rol del usuario en un evento
CREATE OR REPLACE FUNCTION get_user_event_role(p_user_id UUID, p_event_id UUID)
RETURNS user_role AS $$
    SELECT role FROM event_users
    WHERE user_id = p_user_id AND event_id = p_event_id;
$$ LANGUAGE SQL;

-- Verificar si usuario tiene rol específico en evento
CREATE OR REPLACE FUNCTION user_has_event_role(
    p_user_id UUID,
    p_event_id UUID,
    p_required_role user_role
)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM event_users
        WHERE user_id = p_user_id
        AND event_id = p_event_id
        AND (
            CASE p_required_role
                WHEN 'ADMIN' THEN role = 'ADMIN'
                WHEN 'MANAGER' THEN role IN ('ADMIN', 'MANAGER')
                WHEN 'STAFF' THEN role IN ('ADMIN', 'MANAGER', 'STAFF')
            END
        )
    );
$$ LANGUAGE SQL;

-- ============================================================================
-- MIGRACIÓN COMPLETADA
-- ============================================================================
