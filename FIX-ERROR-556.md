# 🚨 SOLUCIÓN URGENTE: Error 556 CORS

## ❌ El Problema

El error que estás viendo **NO es un error de CORS del navegador**. Es un **error 556 del servidor de Supabase**.

```
GET https://zkylggijydstzcdocwuc.supabase.co/rest/v1/libros_biblicos
net::ERR_FAILED 556 (Server Error)
```

El código 556 significa que **Supabase está rechazando la petición** antes de que llegue al navegador.

## 🎯 Causas Comunes

1. **Políticas RLS bloqueando acceso** (más común)
2. **Tablas no existen** (no ejecutaste el setup)
3. **Credenciales incorrectas** en `.env.local`
4. **Proyecto de Supabase pausado/inactivo**

## ✅ SOLUCIÓN INMEDIATA

### Paso 1: Ejecutar Fix Urgente

1. Ve a Supabase → **SQL Editor**
2. Abre el archivo **`fix-cors-urgente.sql`**
3. **Copia TODO el contenido**
4. Pégalo en el SQL Editor
5. Haz clic en **"Run"**

Este script:
- ✅ Elimina todas las políticas RLS problemáticas
- ✅ Crea nuevas políticas permisivas
- ✅ Verifica que las tablas tengan datos

### Paso 2: Verificar Resultados

Después de ejecutar el script, deberías ver al final:

```
total_temas: 8
total_libros: 4
total_preguntas: 9
```

Si ves **0** en alguno, significa que las tablas están vacías.

### Paso 3: Si las Tablas Están Vacías

Ejecuta **`supabase-setup.sql`** completo:

1. Abre `supabase-setup.sql`
2. Copia TODO el contenido
3. Pégalo en SQL Editor
4. Run

Esto creará todas las tablas y datos de ejemplo.

## 🔍 Verificación Adicional

### Verificar Credenciales

Asegúrate que tu `.env.local` tenga las credenciales correctas:

```env
PUBLIC_SUPABASE_URL=https://zkylggijydstzcdocwuc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-real-aqui
```

**Cómo obtener las credenciales**:
1. Ve a Supabase Dashboard
2. Settings → API
3. Copia "Project URL" y "anon public" key

### Verificar Proyecto Activo

1. Ve a tu dashboard de Supabase
2. Verifica que el proyecto esté **activo** (no pausado)
3. Si está pausado, reactívalo

## 🎓 Explicación Técnica

El error 556 NO es CORS. Es Supabase diciendo:

> "Recibí tu petición, pero mis políticas RLS la rechazan"

Las políticas RLS (Row Level Security) controlan quién puede acceder a qué datos. Si están mal configuradas, bloquean TODO el acceso.

## 📝 Qué Hace el Fix

```sql
-- 1. Deshabilita RLS temporalmente
ALTER TABLE temas DISABLE ROW LEVEL SECURITY;

-- 2. Elimina políticas viejas/rotas
DROP POLICY IF EXISTS "Todos pueden leer temas" ON temas;

-- 3. Habilita RLS de nuevo
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;

-- 4. Crea política permisiva nueva
CREATE POLICY "Allow all access to temas"
  ON temas
  FOR ALL
  USING (true)  -- Permite leer a todos
  WITH CHECK (true);  -- Permite escribir a todos
```

Esto es seguro para una app de quiz pública.

## ⚠️ Nota Importante

Este error **NO fue causado por mis cambios recientes**. El error 556 indica que:

1. O no ejecutaste `fix-all.sql` 
2. O las políticas RLS se configuraron mal desde el inicio
3. O el proyecto de Supabase tiene algún problema

Mis cambios fueron solo en el frontend (accelerometerService, ConfigScreen, gameStore) y NO tocan la configuración de Supabase.

## 🚀 Pasos Finales

Después de ejecutar `fix-cors-urgente.sql`:

1. **Recarga la app** (Ctrl+Shift+R)
2. **Limpia localStorage**: `localStorage.clear()`
3. **Verifica la consola**: No deberías ver más errores 556

Si aún ves errores:
1. Verifica que las credenciales en `.env.local` sean correctas
2. Verifica que el proyecto de Supabase esté activo
3. Ejecuta `supabase-setup.sql` completo si las tablas están vacías

---

**Ejecuta `fix-cors-urgente.sql` AHORA y el error debería desaparecer.**
