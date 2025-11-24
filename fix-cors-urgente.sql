-- =============================================
-- FIX URGENTE: Error 556 - CORS/RLS
-- =============================================
-- Este error ocurre cuando las políticas RLS bloquean el acceso
-- Ejecuta este script COMPLETO en Supabase SQL Editor

-- =============================================
-- PASO 1: Deshabilitar RLS temporalmente para diagnóstico
-- =============================================

-- Deshabilitar RLS en tablas públicas
ALTER TABLE temas DISABLE ROW LEVEL SECURITY;
ALTER TABLE libros_biblicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas DISABLE ROW LEVEL SECURITY;

-- =============================================
-- PASO 2: Eliminar políticas antiguas
-- =============================================

-- Eliminar todas las políticas de temas
DROP POLICY IF EXISTS "Todos pueden leer temas" ON temas;
DROP POLICY IF EXISTS "Enable read access for all users" ON temas;
DROP POLICY IF EXISTS "Allow public read access" ON temas;

-- Eliminar todas las políticas de libros
DROP POLICY IF EXISTS "Todos pueden leer libros bíblicos" ON libros_biblicos;
DROP POLICY IF EXISTS "Enable read access for all users" ON libros_biblicos;
DROP POLICY IF EXISTS "Allow public read access" ON libros_biblicos;

-- Eliminar todas las políticas de preguntas
DROP POLICY IF EXISTS "Todos pueden leer preguntas" ON preguntas;
DROP POLICY IF EXISTS "Enable read access for all users" ON preguntas;
DROP POLICY IF EXISTS "Allow public read access" ON preguntas;

-- =============================================
-- PASO 3: Habilitar RLS de nuevo
-- =============================================

ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE libros_biblicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PASO 4: Crear políticas permisivas
-- =============================================

-- Política para temas (acceso público total)
CREATE POLICY "Allow all access to temas"
  ON temas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para libros (acceso público total)
CREATE POLICY "Allow all access to libros_biblicos"
  ON libros_biblicos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para preguntas (acceso público total)
CREATE POLICY "Allow all access to preguntas"
  ON preguntas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- PASO 5: Verificar que las tablas existen y tienen datos
-- =============================================

-- Verificar temas
SELECT COUNT(*) as total_temas FROM temas;

-- Verificar libros
SELECT COUNT(*) as total_libros FROM libros_biblicos;

-- Verificar preguntas
SELECT COUNT(*) as total_preguntas FROM preguntas;

-- Si alguna de estas queries retorna 0, necesitas ejecutar supabase-setup.sql completo

-- =============================================
-- RESULTADO ESPERADO
-- =============================================
-- 
-- Deberías ver:
-- total_temas: 8
-- total_libros: 4
-- total_preguntas: 9
--
-- Si ves 0 en alguna, ejecuta supabase-setup.sql primero
