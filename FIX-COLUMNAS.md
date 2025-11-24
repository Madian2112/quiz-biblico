# 🔧 Fix: Error de Estructura de Función

## ❌ Error Encontrado

```
Error: structure of query does not match function result type
Returned type jsonb does not match expected type integer in column 9
```

## 🎯 Causa del Problema

El orden de las columnas en el `SELECT` de la función `obtener_preguntas_para_juego` no coincidía con el orden definido en `RETURNS TABLE`.

**Orden incorrecto** (líneas 161-171):
```sql
SELECT 
  p.id,
  p.tema_id,
  t.nombre as tema_nombre,
  p.capitulo,
  p.texto_pregunta,
  p.respuesta_correcta,
  p.nivel_dificultad,
  p.versiculo_especifico,
  p.metadata,              -- ❌ Columna 9: JSONB
  COALESCE(pu.veces_mostrada, 0) as veces_usada  -- ❌ Columna 10: INTEGER
```

**Orden en RETURNS TABLE** (líneas 146-156):
```sql
RETURNS TABLE (
  pregunta_id UUID,
  tema_id UUID,
  tema_nombre VARCHAR,
  capitulo INTEGER,
  texto_pregunta TEXT,
  respuesta_correcta TEXT,
  nivel_dificultad VARCHAR,
  versiculo_especifico VARCHAR,
  veces_usada INTEGER,     -- ✅ Columna 9: INTEGER
  metadata JSONB           -- ✅ Columna 10: JSONB
)
```

PostgreSQL esperaba INTEGER en la columna 9 pero recibió JSONB.

## ✅ Solución

He corregido el orden de las columnas en el SELECT para que coincida con RETURNS TABLE.

### Opción 1: Ejecutar el Script de Fix (Más Rápido)

1. Abre Supabase → **SQL Editor**
2. Abre el archivo `fix-function.sql` que acabo de crear
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **Run** (o Ctrl+Enter)
6. Deberías ver: "Success. No rows returned"

### Opción 2: Ejecutar el Setup Completo de Nuevo

Si prefieres ejecutar todo el setup de nuevo:

1. Abre Supabase → **SQL Editor**
2. Abre el archivo `supabase-setup.sql` (ya actualizado)
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **Run**

**Nota**: Esto NO borrará tus datos existentes gracias a las cláusulas `IF NOT EXISTS` y `ON CONFLICT DO NOTHING`.

## 🧪 Verificar que Funciona

Después de ejecutar el fix:

1. Recarga tu aplicación (Ctrl+Shift+R)
2. Selecciona temas y filtros
3. Haz clic en "Iniciar Juego"
4. **Ya NO deberías ver** el error de "structure of query does not match"
5. El juego debería iniciar correctamente

## 📝 Cambios Realizados

### Archivos Actualizados:

1. **`fix-function.sql`** (NUEVO):
   - Script rápido para actualizar solo la función problemática
   - Ejecuta solo este archivo si quieres el fix rápido

2. **`supabase-setup.sql`** (ACTUALIZADO):
   - Corregido el orden de columnas en líneas 167-171
   - Ahora `veces_usada` viene antes de `metadata`

## 🎓 Mejores Prácticas Aplicadas

1. **Orden Consistente**: Las columnas en el SELECT deben estar en el mismo orden que en RETURNS TABLE
2. **Tipado Estricto**: PostgreSQL valida tipos de datos estrictamente
3. **Nombres Explícitos**: Usar alias claros (ej: `veces_usada` en lugar de solo el campo)
4. **Testing**: Siempre verificar que el orden de columnas coincida

## 🔍 Cómo Evitar Este Error en el Futuro

Cuando crees funciones en PostgreSQL:

1. Define primero el `RETURNS TABLE` con los nombres y tipos exactos
2. En el SELECT, usa los **mismos nombres** en el **mismo orden**
3. Usa `SELECT *` solo si estás seguro del orden de las columnas
4. Prueba la función con datos de ejemplo antes de usarla en producción

## ❓ ¿Por Qué Pasó Esto?

Este es un error común cuando:
- Se modifican funciones existentes
- Se agregan columnas nuevas
- Se cambia el orden de las columnas
- Se copia código de diferentes versiones

PostgreSQL es muy estricto con los tipos y el orden de las columnas en funciones que retornan tablas.

---

## 🚀 Siguiente Paso

Ejecuta el script `fix-function.sql` en Supabase y prueba de nuevo. ¡Debería funcionar perfectamente!

Si sigues teniendo problemas, avísame y revisamos juntos.
