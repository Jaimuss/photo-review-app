-- Esquema de base de datos para la aplicación de fotografía

-- Tabla de fotógrafos
CREATE TABLE photographers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    studio_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones fotográficas
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    session_date DATE,
    access_token VARCHAR(255) UNIQUE NOT NULL, -- Token único para acceso del cliente
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fotos
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    upload_order INTEGER, -- Orden de subida/visualización
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de revisiones/calificaciones de fotos
CREATE TABLE photo_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    color_tag VARCHAR(20) CHECK (color_tag IN ('green', 'yellow', 'red')),
    comment TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(photo_id) -- Una revisión por foto
);

-- Índices para optimizar consultas
CREATE INDEX idx_sessions_access_token ON sessions(access_token);
CREATE INDEX idx_sessions_photographer ON sessions(photographer_id);
CREATE INDEX idx_photos_session ON photos(session_id);
CREATE INDEX idx_photo_reviews_photo ON photo_reviews(photo_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_photographers_updated_at BEFORE UPDATE ON photographers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_reviews_updated_at BEFORE UPDATE ON photo_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para obtener estadísticas de sesión
CREATE VIEW session_stats AS
SELECT 
    s.id as session_id,
    s.title,
    s.client_id,
    c.name as client_name,
    COUNT(p.id) as total_photos,
    COUNT(pr.id) as reviewed_photos,
    COUNT(CASE WHEN pr.is_favorite = true THEN 1 END) as favorite_photos,
    COUNT(CASE WHEN pr.color_tag = 'green' THEN 1 END) as selected_photos,
    COUNT(CASE WHEN pr.color_tag = 'yellow' THEN 1 END) as review_photos,
    COUNT(CASE WHEN pr.color_tag = 'red' THEN 1 END) as discard_photos,
    ROUND(
        (COUNT(pr.id)::FLOAT / NULLIF(COUNT(p.id), 0)) * 100, 
        2
    ) as completion_percentage
FROM sessions s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN photos p ON s.id = p.session_id
LEFT JOIN photo_reviews pr ON p.id = pr.photo_id
GROUP BY s.id, s.title, s.client_id, c.name;
