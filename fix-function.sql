-- Script para ACTUALIZAR la función obtener_preguntas_para_juego
-- Ejecuta SOLO este script en el SQL Editor de Supabase

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
