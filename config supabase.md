-- =============================================
-- SCHEMA DE BASE DE DATOS PARA QUIZ BÍBLICO
-- =============================================

-- Tabla de temas
CREATE TABLE temas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono_clase VARCHAR(100), -- Clase de icono de librería (ej: 'lucide:book-open')
  color VARCHAR(20), -- Color hex para UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de libros bíblicos
CREATE TABLE libros_biblicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL UNIQUE,
  abreviatura VARCHAR(10),
  testamento VARCHAR(20) CHECK (testamento IN ('Antiguo', 'Nuevo')),
  total_capitulos INTEGER NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de preguntas (IMPORTANTE: UN SOLO CAPÍTULO POR PREGUNTA)
CREATE TABLE preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
  libro VARCHAR(50) NOT NULL,
  capitulo INTEGER NOT NULL, -- UN SOLO CAPÍTULO
  texto_pregunta TEXT NOT NULL,
  respuesta_correcta TEXT NOT NULL,
  nivel_dificultad VARCHAR(20) CHECK (nivel_dificultad IN ('fácil', 'medio', 'difícil')),
  versiculo_especifico VARCHAR(50), -- Ej: "Génesis 41:16"
  metadata JSONB, -- Para datos adicionales
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_preguntas_tema ON preguntas(tema_id);
CREATE INDEX idx_preguntas_libro ON preguntas(libro);
CREATE INDEX idx_preguntas_capitulo ON preguntas(capitulo);
CREATE INDEX idx_preguntas_libro_capitulo ON preguntas(libro, capitulo);
CREATE INDEX idx_preguntas_busqueda_completa ON preguntas(tema_id, libro, capitulo);

-- Tabla de usuarios (opcional si usas Supabase Auth)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  estadisticas JSONB DEFAULT '{"total_rondas": 0, "total_correctas": 0, "total_jugadas": 0}'::jsonb,
  preferencias JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de juego
CREATE TABLE sesiones_juego (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  temas_ids UUID[] NOT NULL, -- Array de IDs de temas seleccionados
  es_aleatorio BOOLEAN DEFAULT FALSE, -- Si seleccionó modo "Aleatorio"
  libro VARCHAR(50) NOT NULL,
  capitulo_inicio INTEGER NOT NULL,
  capitulo_fin INTEGER NOT NULL,
  duracion_segundos INTEGER NOT NULL,
  total_preguntas_mostradas INTEGER DEFAULT 0,
  total_correctas INTEGER DEFAULT 0,
  total_pasadas INTEGER DEFAULT 0,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  completada BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Índices para sesiones
CREATE INDEX idx_sesiones_usuario ON sesiones_juego(user_id);
CREATE INDEX idx_sesiones_fecha ON sesiones_juego(fecha_inicio DESC);
CREATE INDEX idx_sesiones_temas ON sesiones_juego USING GIN(temas_ids);

-- Tabla de resultados (historial de preguntas por sesión)
CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID REFERENCES sesiones_juego(id) ON DELETE CASCADE,
  pregunta_id UUID REFERENCES preguntas(id),
  correcta BOOLEAN NOT NULL,
  tiempo_respuesta_ms INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para resultados
CREATE INDEX idx_resultados_sesion ON resultados(sesion_id);
CREATE INDEX idx_resultados_pregunta ON resultados(pregunta_id);

-- Tabla para tracking de preguntas usadas por usuario (CACHÉ LOCAL)
CREATE TABLE preguntas_usadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  pregunta_id UUID REFERENCES preguntas(id) ON DELETE CASCADE,
  tema_id UUID REFERENCES temas(id),
  libro VARCHAR(50) NOT NULL,
  capitulo_inicio INTEGER NOT NULL,
  capitulo_fin INTEGER NOT NULL,
  veces_mostrada INTEGER DEFAULT 1,
  ultima_vez TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pregunta_id, tema_id, libro, capitulo_inicio, capitulo_fin)
);

-- Índices para caché de preguntas usadas
CREATE INDEX idx_preguntas_usadas_usuario ON preguntas_usadas(user_id);
CREATE INDEX idx_preguntas_usadas_filtros ON preguntas_usadas(user_id, tema_id, libro, capitulo_inicio, capitulo_fin);
CREATE INDEX idx_preguntas_usadas_pregunta ON preguntas_usadas(pregunta_id);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para preguntas
CREATE TRIGGER update_preguntas_updated_at 
  BEFORE UPDATE ON preguntas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener preguntas según filtros (con soporte para múltiples temas)
CREATE OR REPLACE FUNCTION obtener_preguntas_para_juego(
  p_user_id UUID,
  p_temas_ids UUID[], -- Array de temas
  p_es_aleatorio BOOLEAN, -- Si es modo aleatorio
  p_libro VARCHAR,
  p_cap_inicio INTEGER,
  p_cap_fin INTEGER,
  p_limite INTEGER DEFAULT 100
)
RETURNS TABLE (
  pregunta_id UUID,
  tema_id UUID,
  tema_nombre VARCHAR,
  capitulo INTEGER,
  texto_pregunta TEXT,
  respuesta_correcta TEXT,
  nivel_dificultad VARCHAR,
  versiculo_especifico VARCHAR,
  veces_usada INTEGER,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH preguntas_disponibles AS (
    SELECT 
      p.id,
      p.tema_id,
      t.nombre as tema_nombre,
      p.capitulo,
      p.texto_pregunta,
      p.respuesta_correcta,
      p.nivel_dificultad,
      p.versiculo_especifico,
      p.metadata,
      COALESCE(pu.veces_mostrada, 0) as veces_usada
    FROM preguntas p
    INNER JOIN temas t ON t.id = p.tema_id
    LEFT JOIN preguntas_usadas pu ON 
      pu.pregunta_id = p.id 
      AND pu.user_id = p_user_id
      AND pu.libro = p_libro
      AND pu.capitulo_inicio = p_cap_inicio
      AND pu.capitulo_fin = p_cap_fin
    WHERE 
      p.libro = p_libro
      AND p.capitulo BETWEEN p_cap_inicio AND p_cap_fin
      AND (
        -- Si es aleatorio, obtener de cualquier tema
        p_es_aleatorio = TRUE
        OR 
        -- Si no es aleatorio, filtrar por temas seleccionados
        (p_es_aleatorio = FALSE AND p.tema_id = ANY(p_temas_ids))
      )
    ORDER BY 
      veces_usada ASC,  -- Primero las menos usadas (incluyendo las nunca usadas con 0)
      RANDOM()          -- Luego aleatorio dentro del mismo nivel de uso
    LIMIT p_limite
  )
  SELECT * FROM preguntas_disponibles;
END;
$$ LANGUAGE plpgsql;

-- Función para contar preguntas disponibles
CREATE OR REPLACE FUNCTION contar_preguntas_disponibles(
  p_user_id UUID,
  p_temas_ids UUID[],
  p_es_aleatorio BOOLEAN,
  p_libro VARCHAR,
  p_cap_inicio INTEGER,
  p_cap_fin INTEGER
)
RETURNS JSON AS $$
DECLARE
  total_preguntas INTEGER;
  preguntas_sin_usar INTEGER;
  preguntas_usadas_count INTEGER;
  preguntas_por_tema JSON;
BEGIN
  -- Total de preguntas disponibles con los filtros
  SELECT COUNT(*) INTO total_preguntas
  FROM preguntas p
  WHERE 
    p.libro = p_libro
    AND p.capitulo BETWEEN p_cap_inicio AND p_cap_fin
    AND (
      p_es_aleatorio = TRUE
      OR 
      (p_es_aleatorio = FALSE AND p.tema_id = ANY(p_temas_ids))
    );
  
  -- Preguntas sin usar (que no están en preguntas_usadas para este rango)
  SELECT COUNT(*) INTO preguntas_sin_usar
  FROM preguntas p
  LEFT JOIN preguntas_usadas pu ON 
    pu.pregunta_id = p.id 
    AND pu.user_id = p_user_id
    AND pu.libro = p_libro
    AND pu.capitulo_inicio = p_cap_inicio
    AND pu.capitulo_fin = p_cap_fin
  WHERE 
    p.libro = p_libro
    AND p.capitulo BETWEEN p_cap_inicio AND p_cap_fin
    AND (
      p_es_aleatorio = TRUE
      OR 
      (p_es_aleatorio = FALSE AND p.tema_id = ANY(p_temas_ids))
    )
    AND pu.id IS NULL;
  
  -- Preguntas ya usadas
  preguntas_usadas_count := total_preguntas - preguntas_sin_usar;
  
  -- Contar preguntas por tema (útil para mostrar en UI)
  SELECT json_object_agg(t.nombre, tema_count) INTO preguntas_por_tema
  FROM (
    SELECT 
      te.nombre,
      COUNT(p.id) as tema_count
    FROM temas te
    LEFT JOIN preguntas p ON p.tema_id = te.id
      AND p.libro = p_libro
      AND p.capitulo BETWEEN p_cap_inicio AND p_cap_fin
    WHERE 
      p_es_aleatorio = TRUE
      OR 
      (p_es_aleatorio = FALSE AND te.id = ANY(p_temas_ids))
    GROUP BY te.nombre
  ) tema_count;
  
  RETURN json_build_object(
    'total', total_preguntas,
    'sin_usar', preguntas_sin_usar,
    'usadas', preguntas_usadas_count,
    'porcentaje_sin_usar', 
    CASE 
      WHEN total_preguntas > 0 THEN ROUND((preguntas_sin_usar::NUMERIC / total_preguntas) * 100, 2)
      ELSE 0
    END,
    'por_tema', preguntas_por_tema
  );
END;
$$ LANGUAGE plpgsql;

-- Función para registrar pregunta usada o actualizar contador
CREATE OR REPLACE FUNCTION registrar_pregunta_usada(
  p_user_id UUID,
  p_pregunta_id UUID,
  p_tema_id UUID,
  p_libro VARCHAR,
  p_cap_inicio INTEGER,
  p_cap_fin INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO preguntas_usadas (
    user_id, 
    pregunta_id, 
    tema_id, 
    libro, 
    capitulo_inicio, 
    capitulo_fin,
    veces_mostrada,
    ultima_vez
  )
  VALUES (
    p_user_id,
    p_pregunta_id,
    p_tema_id,
    p_libro,
    p_cap_inicio,
    p_cap_fin,
    1,
    NOW()
  )
  ON CONFLICT (user_id, pregunta_id, tema_id, libro, capitulo_inicio, capitulo_fin)
  DO UPDATE SET
    veces_mostrada = preguntas_usadas.veces_mostrada + 1,
    ultima_vez = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_juego ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_usadas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propia información"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propia información"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propia información"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para sesiones de juego
CREATE POLICY "Los usuarios pueden ver sus propias sesiones"
  ON sesiones_juego FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias sesiones"
  ON sesiones_juego FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias sesiones"
  ON sesiones_juego FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para resultados
CREATE POLICY "Los usuarios pueden ver resultados de sus sesiones"
  ON resultados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sesiones_juego 
      WHERE sesiones_juego.id = resultados.sesion_id 
      AND sesiones_juego.user_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden insertar resultados de sus sesiones"
  ON resultados FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sesiones_juego 
      WHERE sesiones_juego.id = resultados.sesion_id 
      AND sesiones_juego.user_id = auth.uid()
    )
  );

-- Políticas para preguntas usadas
CREATE POLICY "Los usuarios pueden ver sus propias preguntas usadas"
  ON preguntas_usadas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias preguntas usadas"
  ON preguntas_usadas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias preguntas usadas"
  ON preguntas_usadas FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para lectura pública de temas, libros y preguntas
CREATE POLICY "Todos pueden leer temas"
  ON temas FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Todos pueden leer libros bíblicos"
  ON libros_biblicos FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Todos pueden leer preguntas"
  ON preguntas FOR SELECT
  TO authenticated, anon
  USING (true);

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar temas (SIN EMOJIS - usando clases de Lucide Icons)
INSERT INTO temas (nombre, descripcion, icono_clase, color) VALUES
('Historia', 'Eventos y narrativas históricas de la Biblia', 'scroll-text', '#8B4513'),
('Personajes', 'Preguntas sobre personas específicas en la Biblia', 'users', '#4169E1'),
('Interpretación de Sueños', 'Sueños y su significado en la Biblia', 'moon-star', '#9370DB'),
('Geografía', 'Lugares y ubicaciones bíblicas', 'map-pin', '#228B22'),
('Números', 'Cantidades, edades y cifras en la Biblia', 'calculator', '#FF6347'),
('Familia', 'Relaciones familiares y genealogías', 'home', '#FF69B4'),
('Gobierno', 'Estructuras de poder y autoridad', 'crown', '#FFD700'),
('Bendiciones', 'Momentos de bendición y prosperidad', 'sparkles', '#00CED1');

-- Insertar libro de Génesis
INSERT INTO libros_biblicos (nombre, abreviatura, testamento, total_capitulos, orden) VALUES
('Génesis', 'Gn', 'Antiguo', 50, 1);


-- =============================================
-- PREGUNTAS PARA GÉNESIS 41-46
-- IMPORTANTE: Cada pregunta tiene UN SOLO CAPÍTULO

INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico, metadata) VALUES
-- Capítulo 41
((SELECT id FROM temas WHERE nombre = 'Interpretación de Sueños'), (SELECT id FROM libros_biblicos  WHERE nombre = 'Génesis'), 41, 
'¿Cuántas vacas vio Faraón subir del río en su primer sueño?', 
'Siete vacas hermosas y gordas, luego siete vacas feas y flacas', 
'fácil', 
'Génesis 41:2-3',
'{"categoria": "sueños_faraon"}'::jsonb),

((SELECT id FROM temas WHERE nombre = 'Interpretación de Sueños'), (SELECT id FROM libros_biblicos  WHERE nombre = 'Génesis'), 41,
'¿Qué representaban las siete vacas gordas en el sueño de Faraón?',
'Siete años de gran abundancia',
'fácil',
'Génesis 41:26',
'{"categoria": "interpretacion"}'::jsonb),



--- DESPUES AGREGO LAS DEMAS PREGUNTAS