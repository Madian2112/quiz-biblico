Prompt para crear app de Quiz Bíblico con Svelte 5 y Supabase
Necesito crear una aplicación web de quiz bíblico interactivo con las siguientes características:
Funcionalidad Principal

Pantalla de Configuración Inicial:

Selector de tema específico (ej: "Milagros", "Parábolas", "Historia", etc.)
Selector de libro bíblico
Selector de rango de capítulos (o capítulo único)
Selector de duración de ronda (30 seg, 1 min, 2 min, personalizado)


Mecánica del Juego:

Al iniciar, mostrar mensaje para voltear el teléfono a modo horizontal
Detección de orientación del dispositivo usando DeviceOrientation API
Preguntas generadas basadas en el tema y cita bíblica seleccionada
Controles mediante gestos del acelerómetro:

Inclinar hacia arriba = respuesta correcta (avanza a siguiente pregunta)
Inclinar hacia abajo = pasar pregunta


Temporizador countdown visible
Contador de preguntas correctas en tiempo real


Pantalla de Resultados:

Historial completo de todas las preguntas mostradas
Indicador visual de cuáles fueron contestadas correctamente
Estadísticas: total respondidas correctamente / total de preguntas
Opción para jugar de nuevo



Stack Técnico
Frontend:

Svelte 5 con la nueva sintaxis de runas ($state, $derived, $effect)
Implementar mejores prácticas de Svelte 5:

Usar $state para estado reactivo
$derived para valores computados
$effect para efectos secundarios
Snippets para componentes reutilizables
Event handlers con correcta gestión de memoria



Backend/Base de Datos:

Supabase para toda la persistencia de datos
Estructura de base de datos óptima:

Tabla temas (id, nombre, descripción)
Tabla libros_biblicos (id, nombre, total_capitulos)
Tabla preguntas (id, tema_id, libro, capitulo_inicio, capitulo_fin, texto_pregunta, metadata)
Tabla sesiones_juego (id, user_id, tema, configuracion, fecha)
Tabla resultados (id, sesion_id, pregunta_id, correcta, timestamp)


Implementar Row Level Security (RLS) en Supabase
Usar Supabase Auth para gestión de usuarios (opcional pero recomendado)

APIs y Sensores:

DeviceOrientationEvent API para detectar inclinación del dispositivo
Implementar debouncing para evitar múltiples disparos accidentales
Threshold configurable para la sensibilidad de inclinación
Fallback para dispositivos sin acelerómetro (controles táctiles)

Mejores Prácticas a Implementar
Arquitectura y Código:

Arquitectura basada en componentes modulares y reutilizables
Separación de lógica de negocio mediante servicios/stores
TypeScript para type safety
Manejo de errores robusto con try-catch y feedback al usuario
Estados de carga (loading states) y skeleton screens
Optimización de renders con $derived en lugar de recalcular

UX/UI:

Diseño responsive mobile-first
Transiciones suaves entre estados
Feedback visual inmediato en cada acción
Modo landscape obligatorio durante el juego con indicadores claros
Accesibilidad: textos legibles, contraste adecuado, ARIA labels
PWA capabilities (opcional): funcionar offline, instalable

Rendimiento:

Lazy loading de componentes pesados
Prefetch de preguntas para evitar latencia
Caché de datos de Supabase cuando sea apropiado
Optimización de queries (select solo campos necesarios)
Virtual scrolling para listas largas de resultados

Seguridad:

Validación de inputs en cliente y servidor
Rate limiting para prevenir spam
Sanitización de datos antes de guardar
Variables de entorno para credenciales de Supabase

DevOps:

Variables de entorno para configuración
Manejo de diferentes entornos (dev, prod)
Logs estructurados para debugging

Experiencia de Usuario Deseada

Flujo intuitivo y sin fricción
Animaciones que guíen al usuario (ej: flecha indicando dirección de inclinación)
Sonidos opcionales para feedback (correcto/incorrecto)
Celebración visual al completar ronda
Opción de compartir resultados



CONTINUACION DE LOS PROMPTS: Algo mas, me gustaria que esas preguntas se guarden en supabase en donde se especificara la pregunta, el tema que al que pertenece y la referencia biblica para la cual fue creada y colocando la respuesta de la pregunta en supabase, esto con la idea para que cuando el usuario seleccione el libro y el rango de capitulos o solo el capitulo de la biblia la app pueda buscar en supabase preguntas sobre esa cita biblica y usar esas. Me gustaria que se guardase cierta "cache" en el telefono del usuario para no repetir las mismas preguntas en caso de que el usuario seleccione el mismo tema y la misma cita biblica otra vez, esto para no repetir las mismas preguntas que se usaron en la ronda anterior. Otro plus es que me gustaria que al final cuando el usuario seleccione todos los filtros, desde el tema hasta la cita biblica que le aparezca en alguna parte la cantidad de preguntas disponibles que le quedan sin que se repita, es decir si un usuario la hizo una ronda con los mismos filtros y este usuario por el tiempo y el conocimiento que tenia nada mas alcanzo a responder 10 preguntas y en supabase habian 15 preguntas con ese filtro cuando el usuario juegue la segunda ronda le deberan de salir primero las 5 preguntas que no se usaron e la primer ronda y pues obviamente le tendra que salir las demas preguntas que hay en supabase aunque esten repetidas para poder seguir jugando hasta que se termine el juego. Ojo, la data de las preguntas no debe de guardar el rango de capitulos, solo debe de guardar el capitulo de donde se saco y se baso la pregunta, esto porque al momento de que el usuario seleccione el rango de capitulos estos pueden variar y si por ejemplo el usuario selecciona el rango de capitulos de Genesis 41-43 todas esas preguntas que estas insertando no apareceran porque no es el rango que la pregunta que tiene guardada, cuando hay preguntas que si deberian de aparecer ya que hay varias preguntas que se sacaron  de los capitulos 41, 42 y 43 de genesis. Algo mas se podran escoger varios temas para asi poder sacar mas preguntas y se podra dar la opcion de "Aleatorios" que esta opcion servira para escoger preguntas de temas aleatorios entre la cita biblica que escogio.  Y una ultima cosa, especifica en el prompt que no se usen emojis, que se use alguna libreria de iconos pero no emojis. 


Por favor, genera el código completo con estructura de proyecto, configuración de Supabase, y todos los componentes necesarios siguiendo estas especificaciones y las mejores prácticas actuales de desarrollo web.