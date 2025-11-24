# Quiz Bíblico

Aplicación web interactiva de quiz bíblico con control por acelerómetro, construida con **Svelte 5** y **Supabase**.

## 🚀 Características

- ✅ Control por acelerómetro (inclinar dispositivo arriba/abajo)
- ✅ Fallback táctil para dispositivos sin acelerómetro
- ✅ Selección múltiple de temas + modo aleatorio
- ✅ Sistema de caché para no repetir preguntas
- ✅ Contador de preguntas disponibles en tiempo real
- ✅ Modo landscape obligatorio durante el juego
- ✅ Diseño premium con tema oscuro y animaciones suaves
- ✅ Svelte 5 con runas ($state, $derived, $effect)
- ✅ TypeScript para type safety
- ✅ Lucide Icons (sin emojis)

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase (gratis en [supabase.com](https://supabase.com))

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** en el dashboard de Supabase
3. Ejecuta el contenido completo del archivo `supabase-setup.sql`
4. Esto creará todas las tablas, funciones, políticas RLS y datos de ejemplo

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` y agrega tus credenciales de Supabase:

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

Puedes encontrar estas credenciales en:
- Dashboard de Supabase → Settings → API

### 4. Habilitar autenticación anónima (opcional pero recomendado)

En el dashboard de Supabase:
1. Ve a **Authentication** → **Providers**
2. Habilita **Anonymous sign-ins**

Esto permite que los usuarios jueguen sin crear cuenta.

## 🎮 Uso

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción

```bash
npm run build
npm run preview
```

## 📱 Cómo Jugar

1. **Configuración**:
   - Selecciona uno o más temas (o activa modo "Aleatorio")
   - Elige un libro bíblico
   - Define el rango de capítulos
   - Selecciona la duración de la ronda
   - Observa el contador de preguntas disponibles

2. **Juego**:
   - Voltea tu dispositivo a modo horizontal
   - Lee la pregunta y su respuesta
   - Inclina el dispositivo hacia **arriba** si respondiste correctamente
   - Inclina hacia **abajo** para pasar a la siguiente pregunta
   - Si no tienes acelerómetro, usa los botones táctiles

3. **Resultados**:
   - Revisa tu puntuación y estadísticas
   - Ve el historial completo de preguntas
   - Juega de nuevo con la misma configuración (las preguntas no se repetirán)

## 🗄️ Estructura del Proyecto

```
QuizBiblico/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ConfigScreen.svelte      # Pantalla de configuración
│   │   │   ├── GameScreen.svelte        # Pantalla de juego
│   │   │   └── ResultsScreen.svelte     # Pantalla de resultados
│   │   ├── services/
│   │   │   ├── supabaseService.ts       # Queries de Supabase
│   │   │   ├── cacheService.ts          # Caché local
│   │   │   └── accelerometerService.svelte.ts  # Control de acelerómetro
│   │   ├── stores/
│   │   │   └── gameStore.svelte.ts      # Store global con Svelte 5 runes
│   │   ├── supabase.ts                  # Cliente de Supabase
│   │   └── types.ts                     # Tipos TypeScript
│   ├── routes/
│   │   ├── +layout.svelte               # Layout principal
│   │   └── +page.svelte                 # Página principal
│   ├── app.css                          # Estilos globales
│   ├── app.html                         # Template HTML
│   └── app.d.ts                         # Tipos de la app
├── supabase-setup.sql                   # Schema de base de datos
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Personalización

### Agregar Nuevos Temas

Ejecuta en Supabase SQL Editor:

```sql
INSERT INTO temas (nombre, descripcion, icono_clase, color) VALUES
('Milagros', 'Milagros realizados en la Biblia', 'sparkles', '#FF1493');
```

### Agregar Nuevas Preguntas

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Milagros'), 
'Juan', 
2, 
'¿Cuál fue el primer milagro de Jesús?',
'Convertir agua en vino en las bodas de Caná',
'fácil',
'Juan 2:1-11');
```

### Agregar Más Libros Bíblicos

```sql
INSERT INTO libros_biblicos (nombre, abreviatura, testamento, total_capitulos, orden) VALUES
('Salmos', 'Sal', 'Antiguo', 150, 19);
```

## 🔧 Tecnologías Utilizadas

- **[Svelte 5](https://svelte.dev/)** - Framework reactivo con nueva sintaxis de runas
- **[SvelteKit](https://kit.svelte.dev/)** - Framework de aplicaciones web
- **[Supabase](https://supabase.com/)** - Backend as a Service (PostgreSQL)
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Lucide Icons](https://lucide.dev/)** - Librería de iconos
- **[Vite](https://vitejs.dev/)** - Build tool
- **DeviceOrientation API** - Control por acelerómetro

## 📝 Mejores Prácticas Implementadas

### Svelte 5
- ✅ Uso de `$state` para estado reactivo
- ✅ Uso de `$derived` para valores computados
- ✅ Uso de `$effect` para efectos secundarios
- ✅ Arquitectura basada en componentes modulares

### Supabase
- ✅ Row Level Security (RLS) habilitado
- ✅ Funciones de PostgreSQL para queries complejas
- ✅ Índices optimizados para búsquedas rápidas
- ✅ Autenticación anónima para usuarios sin cuenta

### UX/UI
- ✅ Diseño responsive mobile-first
- ✅ Tema oscuro premium con gradientes
- ✅ Animaciones suaves y transiciones
- ✅ Feedback visual inmediato
- ✅ Accesibilidad (ARIA labels, contraste adecuado)

### Rendimiento
- ✅ Lazy loading de componentes
- ✅ Caché local para reducir queries
- ✅ Debouncing en acelerómetro
- ✅ Queries optimizadas (solo campos necesarios)

## 🐛 Solución de Problemas

### El acelerómetro no funciona

- **iOS**: Requiere permisos explícitos. La app mostrará un modal para solicitarlos.
- **Navegadores de escritorio**: No tienen acelerómetro. Usa los controles táctiles.
- **HTTPS requerido**: DeviceOrientation solo funciona en conexiones seguras.

### No aparecen preguntas

1. Verifica que ejecutaste `supabase-setup.sql` completamente
2. Verifica que las políticas RLS estén habilitadas
3. Verifica que la autenticación anónima esté activada en Supabase

### Error de conexión a Supabase

1. Verifica que las variables de entorno en `.env` sean correctas
2. Verifica que tu proyecto de Supabase esté activo
3. Revisa la consola del navegador para más detalles

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.

---

Hecho con ❤️ usando Svelte 5 y Supabase
