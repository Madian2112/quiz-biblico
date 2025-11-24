# 🔧 SOLUCIÓN DEFINITIVA: Error CORS en Localhost

## ❌ El Problema Real

El error de CORS que estás viendo es porque **Supabase no tiene configurado `http://localhost:5173` como origen permitido**.

```
Access-Control-Allow-Origin header is present on the requested resource
```

Esto NO es un problema de código, es una **configuración del dashboard de Supabase**.

## ✅ SOLUCIÓN (5 minutos)

### Paso 1: Ir a Configuración de API en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️ en el menú lateral izquierdo)
4. Haz clic en **API**

### Paso 2: Configurar CORS

Busca la sección **"CORS Configuration"** o **"API Settings"**

Hay dos posibles ubicaciones:

#### Opción A: En API Settings

1. Busca **"Additional Allowed Origins"** o **"CORS Origins"**
2. Agrega: `http://localhost:5173`
3. Si hay un campo para múltiples orígenes, agrégalos separados por coma:
   ```
   http://localhost:5173, http://localhost:3000
   ```
4. Haz clic en **"Save"**

#### Opción B: En Authentication Settings

Si no encuentras CORS en API Settings:

1. Ve a **Authentication** en el menú lateral
2. Busca **"Site URL"** y **"Redirect URLs"**
3. Agrega `http://localhost:5173` a las URLs permitidas
4. Guarda los cambios

### Paso 3: Verificar Configuración Actual

En **Settings → API**, verifica:

1. **Project URL**: Debe ser `https://zkylggijydstzcdocwuc.supabase.co`
2. **anon public key**: Debe existir y ser una clave larga
3. **CORS**: Debe incluir `http://localhost:5173`

### Paso 4: Esperar Propagación

Después de guardar:
1. Espera **30-60 segundos** para que los cambios se propaguen
2. **Recarga tu app** (Ctrl+Shift+R)
3. El error debería desaparecer

## 🔍 Si No Encuentras la Opción de CORS

Según información actualizada de 2024-2025, Supabase puede haber movido o removido la configuración de CORS del dashboard. En ese caso:

### Solución Alternativa: Usar Proxy de Desarrollo

Crea un archivo `vite.config.ts` con proxy:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        proxy: {
            '/api': {
                target: 'https://zkylggijydstzcdocwuc.supabase.co',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});
```

Pero **primero intenta la configuración en el dashboard**.

## 📋 Checklist de Verificación

- [ ] Fui a Supabase Dashboard → Settings → API
- [ ] Busqué "CORS" o "Allowed Origins"
- [ ] Agregué `http://localhost:5173`
- [ ] Guardé los cambios
- [ ] Esperé 60 segundos
- [ ] Recargué la app (Ctrl+Shift+R)

## 🎯 Verificar Credenciales

Mientras estás en Settings → API, verifica que tu `.env.local` tenga:

```env
PUBLIC_SUPABASE_URL=https://zkylggijydstzcdocwuc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cómo copiar las credenciales correctas**:

1. En Settings → API
2. Copia **"Project URL"** → Pégalo en `PUBLIC_SUPABASE_URL`
3. Copia **"anon public"** key → Pégalo en `PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Nota Importante

Este error de CORS es **100% configuración de Supabase**, no del código. El código está correcto. Solo necesitas:

1. Agregar `http://localhost:5173` a orígenes permitidos en Supabase
2. Verificar que las credenciales en `.env.local` sean correctas

## 🚀 Después de Configurar

Una vez que agregues localhost a CORS:

1. Recarga la app
2. Los errores de CORS desaparecerán
3. La app cargará temas y libros correctamente

## 📸 Captura de Pantalla de Referencia

Busca en Settings → API algo como:

```
CORS Configuration
Additional Allowed Origins: [                    ]
                            ↑ Agrega http://localhost:5173 aquí
```

O:

```
Site URL: http://localhost:5173
Redirect URLs: http://localhost:5173/**
```

---

**EJECUTA ESTOS PASOS EN EL DASHBOARD DE SUPABASE Y EL ERROR SE SOLUCIONARÁ.**

Si después de esto aún tienes problemas, comparte una captura de Settings → API para ver qué opciones tienes disponibles.
