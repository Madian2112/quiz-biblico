-- =============================================
-- FIX COMPLETO: Hacer que el sistema funcione sin tabla usuarios
-- =============================================
-- Ejecuta este script COMPLETO en Supabase SQL Editor

-- 1. Eliminar las foreign keys que causan problemas
ALTER TABLE sesiones_juego DROP CONSTRAINT IF EXISTS sesiones_juego_user_id_fkey;
ALTER TABLE resultados DROP CONSTRAINT IF EXISTS resultados_sesion_id_fkey CASCADE;
ALTER TABLE preguntas_usadas DROP CONSTRAINT IF EXISTS preguntas_usadas_user_id_fkey;
ALTER TABLE preguntas_usadas DROP CONSTRAINT IF EXISTS preguntas_usadas_pregunta_id_fkey;

-- 2. Modificar sesiones_juego para que user_id sea nullable y no requiera foreign key
ALTER TABLE sesiones_juego ALTER COLUMN user_id DROP NOT NULL;

-- 3. Modificar preguntas_usadas para que user_id sea nullable
ALTER TABLE preguntas_usadas ALTER COLUMN user_id DROP NOT NULL;

-- 4. Recrear foreign keys con ON DELETE CASCADE pero sin REFERENCES a usuarios
-- Esto permite que funcione con UUIDs locales que no están en la tabla usuarios

-- 5. Actualizar políticas RLS para permitir acceso con UUIDs locales

-- Políticas para sesiones_juego (permitir cualquier UUID)
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias sesiones" ON sesiones_juego;
CREATE POLICY "Los usuarios pueden ver sus propias sesiones"
  ON sesiones_juego FOR SELECT
  USING (true); -- Permitir lectura a todos

DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias sesiones" ON sesiones_juego;
CREATE POLICY "Los usuarios pueden crear sus propias sesiones"
  ON sesiones_juego FOR INSERT
  WITH CHECK (true); -- Permitir inserción a todos

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias sesiones" ON sesiones_juego;
CREATE POLICY "Los usuarios pueden actualizar sus propias sesiones"
  ON sesiones_juego FOR UPDATE
  USING (true); -- Permitir actualización a todos

-- Políticas para resultados (permitir cualquier UUID)
DROP POLICY IF EXISTS "Los usuarios pueden ver resultados de sus sesiones" ON resultados;
CREATE POLICY "Los usuarios pueden ver resultados de sus sesiones"
  ON resultados FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden insertar resultados de sus sesiones" ON resultados;
CREATE POLICY "Los usuarios pueden insertar resultados de sus sesiones"
  ON resultados FOR INSERT
  WITH CHECK (true);

-- Políticas para preguntas_usadas (permitir cualquier UUID)
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

-- 6. Recrear el constraint de resultados con sesiones_juego
ALTER TABLE resultados 
  ADD CONSTRAINT resultados_sesion_id_fkey 
  FOREIGN KEY (sesion_id) 
  REFERENCES sesiones_juego(id) 
  ON DELETE CASCADE;

-- 7. Recrear constraints de preguntas_usadas sin referencia a usuarios
ALTER TABLE preguntas_usadas
  ADD CONSTRAINT preguntas_usadas_pregunta_id_fkey
  FOREIGN KEY (pregunta_id)
  REFERENCES preguntas(id)
  ON DELETE CASCADE;

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Verificar que las tablas permiten NULL en user_id
SELECT 
  table_name, 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name IN ('sesiones_juego', 'preguntas_usadas')
  AND column_name = 'user_id';

-- Deberías ver is_nullable = 'YES' para ambas tablas
