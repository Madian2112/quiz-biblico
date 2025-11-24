import type {
    EstadoJuego,
    ConfiguracionJuego,
    PreguntaConTema,
    Tema,
    LibroBiblico,
    PreguntasDisponibles
} from '$lib/types';
import { SupabaseService } from '$lib/services/supabaseService';
import { CacheService } from '$lib/services/cacheService';
import { accelerometerService } from '$lib/services/accelerometerService.svelte';

/**
 * Store global del juego usando Svelte 5 runes
 * Implementa las mejores prácticas de gestión de estado reactivo
 */
class GameStore {
    // Estado del juego
    estado = $state<EstadoJuego>('configuracion');

    // Datos de configuración
    temas = $state<Tema[]>([]);
    libros = $state<LibroBiblico[]>([]);
    temasSeleccionados = $state<string[]>([]);
    esAleatorio = $state(false);
    libroSeleccionado = $state<string>('');
    capituloInicio = $state(1);
    capituloFin = $state(1);
    duracionSegundos = $state(60);

    // Información de preguntas disponibles
    preguntasDisponibles = $state<PreguntasDisponibles>({
        total: 0,
        sin_usar: 0,
        usadas: 0,
        porcentaje_sin_usar: 0,
        por_tema: {}
    });

    // Estado del juego activo
    preguntas = $state<PreguntaConTema[]>([]);
    preguntaActualIndex = $state(0);
    respuestasCorrectas = $state(0);
    respuestasPasadas = $state(0);
    tiempoRestante = $state(0);
    sesionId = $state<string | null>(null);
    userId = $state<string>('');

    // Historial de respuestas
    historial = $state<
        Array<{
            pregunta: PreguntaConTema;
            correcta: boolean;
            tiempoRespuesta: number;
        }>
    >([]);

    // Estados de carga
    cargando = $state(false);
    error = $state<string | null>(null);

    // Valores derivados usando $derived
    preguntaActual = $derived.by(() => {
        return this.preguntas[this.preguntaActualIndex] || null;
    });

    totalPreguntasMostradas = $derived.by(() => {
        return this.historial.length;
    });

    porcentajeCompletado = $derived.by(() => {
        if (this.duracionSegundos === 0) return 0;
        return ((this.duracionSegundos - this.tiempoRestante) / this.duracionSegundos) * 100;
    });

    libroSeleccionadoData = $derived.by(() => {
        return this.libros.find((l) => l.nombre === this.libroSeleccionado) || null;
    });

    /**
     * Inicializa el store cargando datos de Supabase
     */
    async inicializar(): Promise<void> {
        try {
            this.cargando = true;
            this.error = null;

            // Obtener o crear usuario
            this.userId = await SupabaseService.obtenerOCrearUsuarioAnonimo();
            CacheService.establecerUserId(this.userId);

            // Cargar temas y libros en paralelo
            const [temas, libros] = await Promise.all([
                SupabaseService.obtenerTemas(),
                SupabaseService.obtenerLibros()
            ]);

            this.temas = temas;
            this.libros = libros;

            // Seleccionar primer libro por defecto
            if (libros.length > 0) {
                this.libroSeleccionado = libros[0].nombre;
                this.capituloFin = libros[0].total_capitulos;
            }
        } catch (err) {
            console.error('Error inicializando:', err);
            this.error = 'Error cargando datos iniciales';
        } finally {
            this.cargando = false;
        }
    }

    /**
     * Actualiza el contador de preguntas disponibles
     */
    async actualizarPreguntasDisponibles(): Promise<void> {
        if (
            this.temasSeleccionados.length === 0 &&
            !this.esAleatorio ||
            !this.libroSeleccionado
        ) {
            this.preguntasDisponibles = {
                total: 0,
                sin_usar: 0,
                usadas: 0,
                porcentaje_sin_usar: 0,
                por_tema: {}
            };
            return;
        }

        try {
            const disponibles = await SupabaseService.contarPreguntasDisponibles(
                this.userId,
                this.temasSeleccionados,
                this.esAleatorio,
                this.libroSeleccionado,
                this.capituloInicio,
                this.capituloFin
            );

            this.preguntasDisponibles = disponibles;
        } catch (err) {
            console.error('Error actualizando preguntas disponibles:', err);
        }
    }

    /**
     * Inicia una nueva partida
     * Permite jugar siempre, incluso si todas las preguntas ya fueron usadas
     */
    async iniciarJuego(): Promise<void> {
        try {
            this.cargando = true;
            this.error = null;

            // Validar configuración
            if (this.temasSeleccionados.length === 0 && !this.esAleatorio) {
                throw new Error('Debes seleccionar al menos un tema');
            }

            // Obtener preguntas
            const preguntas = await SupabaseService.obtenerPreguntasParaJuego(
                this.userId,
                this.temasSeleccionados,
                this.esAleatorio,
                this.libroSeleccionado,
                this.capituloInicio,
                this.capituloFin,
                100
            );

            // Si no hay preguntas en la base de datos, mostrar error
            if (preguntas.length === 0) {
                throw new Error('No hay preguntas en la base de datos con estos filtros. Por favor, agrega preguntas primero.');
            }

            // Crear sesión en Supabase
            this.sesionId = await SupabaseService.crearSesion(
                this.userId,
                this.temasSeleccionados,
                this.esAleatorio,
                this.libroSeleccionado,
                this.capituloInicio,
                this.capituloFin,
                this.duracionSegundos
            );

            // Inicializar estado del juego
            this.preguntas = preguntas;
            this.preguntaActualIndex = 0;
            this.respuestasCorrectas = 0;
            this.respuestasPasadas = 0;
            this.tiempoRestante = this.duracionSegundos;
            this.historial = [];
            this.estado = 'jugando';

            // Iniciar temporizador
            this.iniciarTemporizador();
        } catch (err: any) {
            console.error('Error iniciando juego:', err);
            this.error = err.message || 'Error iniciando el juego';
        } finally {
            this.cargando = false;
        }
    }

    /**
     * Temporizador del juego
     */
    private temporizadorInterval: number | null = null;

    private iniciarTemporizador(): void {
        this.detenerTemporizador();

        this.temporizadorInterval = window.setInterval(() => {
            if (this.tiempoRestante > 0) {
                this.tiempoRestante--;
            } else {
                this.finalizarJuego();
            }
        }, 1000);
    }

    private detenerTemporizador(): void {
        if (this.temporizadorInterval !== null) {
            clearInterval(this.temporizadorInterval);
            this.temporizadorInterval = null;
        }
    }

    /**
     * Responde correctamente a la pregunta actual
     */
    async responderCorrecto(): Promise<void> {
        if (!this.preguntaActual || this.estado !== 'jugando') return;

        const pregunta = this.preguntaActual;
        const tiempoRespuesta = this.duracionSegundos - this.tiempoRestante;

        // Agregar al historial
        this.historial.push({
            pregunta,
            correcta: true,
            tiempoRespuesta
        });

        this.respuestasCorrectas++;

        // Registrar en Supabase (sin esperar)
        if (this.sesionId) {
            SupabaseService.registrarResultado(this.sesionId, pregunta.id, true, tiempoRespuesta * 1000);
            SupabaseService.registrarPreguntaUsada(
                this.userId,
                pregunta.id,
                pregunta.tema_id,
                this.libroSeleccionado,
                this.capituloInicio,
                this.capituloFin
            );
        }

        // Registrar en caché local
        CacheService.agregarPreguntaUsada(
            {
                temasIds: this.temasSeleccionados,
                esAleatorio: this.esAleatorio,
                libro: this.libroSeleccionado,
                capInicio: this.capituloInicio,
                capFin: this.capituloFin
            },
            pregunta.id
        );

        // Avanzar a la siguiente pregunta
        this.siguientePregunta();
    }

    /**
     * Pasa la pregunta actual
     */
    async pasarPregunta(): Promise<void> {
        if (!this.preguntaActual || this.estado !== 'jugando') return;

        const pregunta = this.preguntaActual;
        const tiempoRespuesta = this.duracionSegundos - this.tiempoRestante;

        // Agregar al historial
        this.historial.push({
            pregunta,
            correcta: false,
            tiempoRespuesta
        });

        this.respuestasPasadas++;

        // Registrar en Supabase (sin esperar)
        if (this.sesionId) {
            SupabaseService.registrarResultado(
                this.sesionId,
                pregunta.id,
                false,
                tiempoRespuesta * 1000
            );
            SupabaseService.registrarPreguntaUsada(
                this.userId,
                pregunta.id,
                pregunta.tema_id,
                this.libroSeleccionado,
                this.capituloInicio,
                this.capituloFin
            );
        }

        // Registrar en caché local
        CacheService.agregarPreguntaUsada(
            {
                temasIds: this.temasSeleccionados,
                esAleatorio: this.esAleatorio,
                libro: this.libroSeleccionado,
                capInicio: this.capituloInicio,
                capFin: this.capituloFin
            },
            pregunta.id
        );

        // Avanzar a la siguiente pregunta
        this.siguientePregunta();
    }

    /**
     * Avanza a la siguiente pregunta
     */
    private siguientePregunta(): void {
        if (this.preguntaActualIndex < this.preguntas.length - 1) {
            this.preguntaActualIndex++;
        } else {
            // No hay más preguntas, finalizar
            this.finalizarJuego();
        }
    }

    /**
     * Finaliza el juego
     */
    async finalizarJuego(): Promise<void> {
        this.detenerTemporizador();

        // Actualizar sesión en Supabase
        if (this.sesionId) {
            await SupabaseService.finalizarSesion(
                this.sesionId,
                this.totalPreguntasMostradas,
                this.respuestasCorrectas,
                this.respuestasPasadas
            );
        }

        // Reproducir sonido de fin de juego
        accelerometerService.playSoundGameOver();

        this.estado = 'resultados';
    }

    /**
     * Vuelve a la configuración para jugar de nuevo
     */
    volverAConfigurar(): void {
        this.detenerTemporizador();
        this.estado = 'configuracion';
        this.preguntas = [];
        this.preguntaActualIndex = 0;
        this.historial = [];
        this.sesionId = null;

        // Actualizar contador de preguntas disponibles
        this.actualizarPreguntasDisponibles();
    }

    /**
     * Limpia el store al destruir
     */
    destruir(): void {
        this.detenerTemporizador();
    }
}

// Exportar instancia singleton
export const gameStore = new GameStore();
