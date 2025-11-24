# 🚀 Guía Rápida de Configuración

## Paso 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Crea una cuenta o inicia sesión
4. Crea un nuevo proyecto:
   - Nombre: `quiz-biblico` (o el que prefieras)
   - Database Password: Guarda esta contraseña
   - Region: Elige la más cercana a ti
   - Haz clic en "Create new project"
   - Espera 2-3 minutos mientras se crea

### 1.2 Ejecutar el Schema SQL
1. En el dashboard de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Haz clic en "New query"
3. Abre el archivo `supabase-setup.sql` de este proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en "Run" (o presiona Ctrl+Enter)
7. Deberías ver "Success. No rows returned" - ¡Esto es correcto!

### 1.3 Habilitar Autenticación Anónima
1. Ve a **Authentication** → **Providers** en el menú lateral
2. Busca "Anonymous sign-ins"
3. Activa el toggle para habilitarlo
4. Haz clic en "Save"

### 1.4 Obtener Credenciales
1. Ve a **Settings** → **API** en el menú lateral
2. Encontrarás dos valores importantes:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public key**: Una clave larga que empieza con `eyJ...`
3. Copia estos valores (los necesitarás en el siguiente paso)

## Paso 2: Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo llamado `.env` (sin extensión)
2. Copia el contenido de `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Abre `.env` y reemplaza los valores:
   ```env
   PUBLIC_SUPABASE_URL=https://tu-proyecto-real.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Paso 3: Instalar Dependencias (Ya hecho)

```bash
npm install
```

## Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## ✅ Verificar que Todo Funciona

1. Abre `http://localhost:5173` en tu navegador
2. Deberías ver la pantalla de configuración con:
   - Lista de temas (Historia, Personajes, etc.)
   - Selector de libro bíblico (Génesis, Éxodo, etc.)
   - Selector de capítulos
   - Selector de duración
   - Contador de preguntas disponibles

3. Si ves esto, ¡todo está funcionando! 🎉

## 🐛 Problemas Comunes

### Error: "Missing Supabase environment variables"
- Verifica que creaste el archivo `.env` (no `.env.example`)
- Verifica que las variables empiecen con `PUBLIC_`
- Reinicia el servidor de desarrollo (`Ctrl+C` y luego `npm run dev`)

### No aparecen temas o libros
- Verifica que ejecutaste TODO el contenido de `supabase-setup.sql`
- Ve a Supabase → Table Editor y verifica que existan las tablas `temas` y `libros_biblicos` con datos

### Error de autenticación
- Verifica que habilitaste "Anonymous sign-ins" en Supabase
- Ve a Authentication → Providers y asegúrate que esté activado

## 📱 Probar en Dispositivo Móvil

Para probar el acelerómetro en tu teléfono:

1. Asegúrate que tu computadora y teléfono estén en la misma red WiFi
2. Encuentra la IP de tu computadora:
   - Windows: `ipconfig` (busca IPv4)
   - Mac/Linux: `ifconfig` (busca inet)
3. En tu teléfono, abre el navegador y ve a:
   ```
   http://TU-IP:5173
   ```
   Por ejemplo: `http://192.168.1.100:5173`

**Nota**: El acelerómetro solo funciona en HTTPS en producción. Para desarrollo local, algunos navegadores móviles lo permiten en HTTP.

## 🎮 Agregar Más Preguntas

Para agregar tus propias preguntas, ve a Supabase → SQL Editor y ejecuta:

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Génesis', 
1, 
'¿Cuántos días tomó la creación?',
'Seis días, y el séptimo descansó',
'fácil',
'Génesis 1:1-2:3');
```

## 🚀 Desplegar a Producción

Cuando estés listo para desplegar:

### Opción 1: Vercel (Recomendado)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Agrega las variables de entorno en Settings
4. Despliega

### Opción 2: Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto
3. Agrega las variables de entorno
4. Despliega

¡Listo! Ahora tienes tu quiz bíblico funcionando 🎉
