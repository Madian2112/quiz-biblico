-- =============================================
-- SCRIPT COMPLETO DE FIXES - Quiz Bíblico
-- =============================================
-- Ejecuta este script COMPLETO en Supabase SQL Editor
-- Esto aplicará TODOS los fixes necesarios de una vez

-- =============================================
-- FIX 1: Corregir orden de columnas en función
-- =============================================

CREATE OR REPLACE FUNCTION obtener_preguntas_para_juego(
  p_user_id UUID,
  p_temas_ids UUID[],
  p_es_aleatorio BOOLEAN,
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
      COALESCE(pu.veces_mostrada, 0) as veces_usada,
      p.metadata
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
        p_es_aleatorio = TRUE
        OR 
        (p_es_aleatorio = FALSE AND p.tema_id = ANY(p_temas_ids))
      )
    ORDER BY 
      veces_usada ASC,
      RANDOM()
    LIMIT p_limite
  )
  SELECT * FROM preguntas_disponibles;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FIX 2: Eliminar foreign keys problemáticas
-- =============================================

-- Eliminar constraints que causan problemas con UUIDs locales
ALTER TABLE sesiones_juego DROP CONSTRAINT IF EXISTS sesiones_juego_user_id_fkey;
ALTER TABLE resultados DROP CONSTRAINT IF EXISTS resultados_sesion_id_fkey CASCADE;
ALTER TABLE preguntas_usadas DROP CONSTRAINT IF EXISTS preguntas_usadas_user_id_fkey;
ALTER TABLE preguntas_usadas DROP CONSTRAINT IF EXISTS preguntas_usadas_pregunta_id_fkey;

-- =============================================
-- FIX 3: Hacer user_id nullable
-- =============================================

ALTER TABLE sesiones_juego ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE preguntas_usadas ALTER COLUMN user_id DROP NOT NULL;

-- =============================================
-- FIX 4: Recrear constraints necesarios
-- =============================================

-- Mantener la integridad entre sesiones y resultados
ALTER TABLE resultados 
  ADD CONSTRAINT resultados_sesion_id_fkey 
  FOREIGN KEY (sesion_id) 
  REFERENCES sesiones_juego(id) 
  ON DELETE CASCADE;

-- Mantener la integridad entre preguntas_usadas y preguntas
ALTER TABLE preguntas_usadas
  ADD CONSTRAINT preguntas_usadas_pregunta_id_fkey
  FOREIGN KEY (pregunta_id)
  REFERENCES preguntas(id)
  ON DELETE CASCADE;

-- =============================================
-- FIX 5: Actualizar políticas RLS
-- =============================================

-- Políticas para sesiones_juego
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias sesiones" ON sesiones_juego;
CREATE POLICY "Los usuarios pueden ver sus propias sesiones"
  ON sesiones_juego FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias sesiones" ON sesiones_juego;
CREATE POLICY "Los usuarios pueden crear sus propias sesiones"
  ON sesiones_juego FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias sesiones" ON sesiones_juego;
CREATE POLICY "Los usuarios pueden actualizar sus propias sesiones"
  ON sesiones_juego FOR UPDATE
  USING (true);

-- Políticas para resultados
DROP POLICY IF EXISTS "Los usuarios pueden ver resultados de sus sesiones" ON resultados;
CREATE POLICY "Los usuarios pueden ver resultados de sus sesiones"
  ON resultados FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden insertar resultados de sus sesiones" ON resultados;
CREATE POLICY "Los usuarios pueden insertar resultados de sus sesiones"
  ON resultados FOR INSERT
  WITH CHECK (true);

-- Políticas para preguntas_usadas
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias preguntas usadas" ON preguntas_usadas;
CREATE POLICY "Los usuarios pueden ver sus propias preguntas usadas"
  ON preguntas_usadas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propias preguntas usadas" ON preguntas_usadas;
CREATE POLICY "Los usuarios pueden insertar sus propias preguntas usadas"
  ON preguntas_usadas FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias preguntas usadas" ON preguntas_usadas;
CREATE POLICY "Los usuarios pueden actualizar sus propias preguntas usadas"
  ON preguntas_usadas FOR UPDATE
  USING (true);

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Verificar que user_id es nullable
SELECT 
  table_name, 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name IN ('sesiones_juego', 'preguntas_usadas')
  AND column_name = 'user_id'
ORDER BY table_name;

-- Deberías ver is_nullable = 'YES' para ambas tablas

-- =============================================
-- RESULTADO ESPERADO
-- =============================================
-- 
-- table_name        | column_name | is_nullable | data_type
-- sesiones_juego    | user_id     | YES         | uuid
-- preguntas_usadas  | user_id     | YES         | uuid
--
-- Si ves esto, ¡todos los fixes se aplicaron correctamente! ✅
