# 🎯 SOLUCIÓN REAL: Error "Failed to fetch" en Supabase

## ⚠️ IMPORTANTE: CORS vs Edge Functions

La documentación que viste (`https://supabase.com/docs/guides/functions/cors`) es para **Edge Functions**, NO para la API REST normal.

**Tu app usa la API REST de Supabase (PostgREST)**, que:
- ✅ Ya tiene CORS habilitado por defecto
- ✅ NO requiere configuración adicional de CORS
- ✅ NO necesita el archivo `_shared/cors.ts`

## 🔍 El Problema Real

Según la investigación actualizada (2024-2025):

1. **Supabase removió la configuración de CORS del dashboard**
2. **PostgREST agrega headers CORS automáticamente**
3. **Tu error NO es de CORS, es de credenciales o RLS**

El error "Failed to fetch" generalmente significa:

1. ❌ **Credenciales incorrectas** (URL o anon key)
2. ❌ **Proyecto pausado** (free tier inactivo)
3. ❌ **Políticas RLS bloqueando acceso**
4. ❌ **Tablas no existen**

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Verificar Credenciales

1. Ve a Supabase Dashboard → **Settings** → **API**
2. Copia exactamente:
   - **Project URL** (ej: `https://zkylggijydstzcdocwuc.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)

3. Abre tu `.env.local` y verifica que sean EXACTAMENTE iguales:

```env
PUBLIC_SUPABASE_URL=https://zkylggijydstzcdocwuc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANTE**: 
- ✅ NO debe haber espacios
- ✅ NO debe haber comillas extras
- ✅ Debe ser la clave **anon public**, NO service_role

### Paso 2: Verificar Proyecto Activo

1. Ve a tu Dashboard de Supabase
2. Verifica que el proyecto esté **ACTIVO** (no pausado)
3. Si está pausado, haz clic en "Resume project"

### Paso 3: Ejecutar Setup Completo

Ejecuta este script en Supabase SQL Editor:

```sql
-- Verificar que las tablas existen
SELECT 'temas' as tabla, COUNT(*) as registros FROM temas
UNION ALL
SELECT 'libros_biblicos', COUNT(*) FROM libros_biblicos
UNION ALL
SELECT 'preguntas', COUNT(*) FROM preguntas;
```

**Resultado esperado**:
```
tabla             | registros
temas             | 8
libros_biblicos   | 4
preguntas         | 9
```

Si ves **0**, ejecuta `supabase-setup.sql` completo.

### Paso 4: Verificar Políticas RLS

Ejecuta en SQL Editor:

```sql
-- Ver políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('temas', 'libros_biblicos', 'preguntas')
ORDER BY tablename, policyname;
```

Deberías ver políticas que permitan acceso a `anon`.

Si NO ves políticas o están mal, ejecuta `fix-cors-urgente.sql`.

### Paso 5: Probar Conexión Directa

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Reemplaza con tus credenciales reales
const url = 'https://zkylggijydstzcdocwuc.supabase.co';
const key = 'tu-anon-key-aqui';

fetch(`${url}/rest/v1/temas?select=*`, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(r => r.json())
.then(d => console.log('✅ Funciona:', d))
.catch(e => console.error('❌ Error:', e));
```

**Si funciona**: El problema es tu código
**Si NO funciona**: El problema es Supabase (credenciales o proyecto)

## 🐛 Diagnóstico por Tipo de Error

### Error: "Failed to fetch"
- **Causa**: Credenciales incorrectas o proyecto pausado
- **Solución**: Verifica credenciales y estado del proyecto

### Error: "No rows returned"
- **Causa**: RLS bloqueando o tablas vacías
- **Solución**: Ejecuta `fix-cors-urgente.sql` y `supabase-setup.sql`

### Error: "Invalid API key"
- **Causa**: Anon key incorrecta
- **Solución**: Copia de nuevo desde Settings → API

### Error: "Project paused"
- **Causa**: Proyecto inactivo (free tier)
- **Solución**: Resume el proyecto desde el dashboard

## 📝 Checklist Final

- [ ] Copié URL y anon key exactamente desde Settings → API
- [ ] Verifiqué que no hay espacios ni comillas extras en `.env.local`
- [ ] Verifiqué que el proyecto esté activo (no pausado)
- [ ] Ejecuté la query de verificación de tablas
- [ ] Las tablas tienen datos (no están vacías)
- [ ] Ejecuté `fix-cors-urgente.sql` para políticas RLS
- [ ] Probé la conexión directa desde la consola
- [ ] Recargué la app después de cambiar `.env.local`

## ⚠️ Nota sobre CORS

**NO necesitas configurar CORS para la API REST de Supabase.**

El archivo `_shared/cors.ts` que viste en la documentación es SOLO para Edge Functions (funciones serverless de Supabase), no para la API REST normal.

Tu app usa:
- ✅ `@supabase/supabase-js` → API REST → CORS automático
- ❌ Edge Functions → Requiere configuración manual de CORS

## 🚀 Solución Rápida

Si después de todo esto sigue sin funcionar:

1. **Crea un proyecto nuevo en Supabase** (para descartar problemas del proyecto actual)
2. **Copia las nuevas credenciales**
3. **Ejecuta `supabase-setup.sql` en el nuevo proyecto**
4. **Actualiza `.env.local` con las nuevas credenciales**
5. **Recarga la app**

---

**El 99% de los casos de "Failed to fetch" se resuelven verificando credenciales y estado del proyecto.**
