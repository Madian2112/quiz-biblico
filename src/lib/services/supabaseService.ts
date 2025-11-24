import { supabase } from '$lib/supabase';
import type {
    Tema,
    LibroBiblico,
    PreguntaConTema,
    PreguntasDisponibles,
    SesionJuego,
    Resultado
} from '$lib/types';

/**
 * Servicio para interactuar con Supabase
 * Implementa las mejores prácticas de queries optimizadas y manejo de errores
 */
export class SupabaseService {
    /**
     * Obtiene todos los temas disponibles
     */
    static async obtenerTemas(): Promise<Tema[]> {
        try {
            const { data, error } = await supabase
                .from('temas')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo temas:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los libros bíblicos
     */
    static async obtenerLibros(): Promise<LibroBiblico[]> {
        try {
            const { data, error } = await supabase
                .from('libros_biblicos')
                .select('*')
                .order('orden', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo libros:', error);
            throw error;
        }
    }

    /**
     * Obtiene preguntas para el juego usando la función de Supabase
     */
    static async obtenerPreguntasParaJuego(
        userId: string,
        temasIds: string[],
        esAleatorio: boolean,
        libro: string,
        capInicio: number,
        capFin: number,
        limite: number = 100
    ): Promise<PreguntaConTema[]> {
        try {
            const { data, error } = await supabase.rpc('obtener_preguntas_para_juego', {
                p_user_id: userId,
                p_temas_ids: temasIds,
                p_es_aleatorio: esAleatorio,
                p_libro: libro,
                p_cap_inicio: capInicio,
                p_cap_fin: capFin,
                p_limite: limite
            });

            if (error) throw error;

            // Mapear los resultados al tipo correcto
            return (data || []).map((row: any) => ({
                id: row.pregunta_id,
                tema_id: row.tema_id,
                libro: libro,
                capitulo: row.capitulo,
                texto_pregunta: row.texto_pregunta,
                respuesta_correcta: row.respuesta_correcta,
                nivel_dificultad: row.nivel_dificultad,
                versiculo_especifico: row.versiculo_especifico,
                metadata: row.metadata,
                created_at: '',
                updated_at: '',
                tema_nombre: row.tema_nombre,
                veces_usada: row.veces_usada || 0
            }));
        } catch (error) {
            console.error('Error obteniendo preguntas:', error);
            throw error;
        }
    }

    /**
     * Cuenta las preguntas disponibles según filtros
     */
    static async contarPreguntasDisponibles(
        userId: string,
        temasIds: string[],
        esAleatorio: boolean,
        libro: string,
        capInicio: number,
        capFin: number
    ): Promise<PreguntasDisponibles> {
        try {
            const { data, error } = await supabase.rpc('contar_preguntas_disponibles', {
                p_user_id: userId,
                p_temas_ids: temasIds,
                p_es_aleatorio: esAleatorio,
                p_libro: libro,
                p_cap_inicio: capInicio,
                p_cap_fin: capFin
            });

            if (error) throw error;
            return data as PreguntasDisponibles;
        } catch (error) {
            console.error('Error contando preguntas:', error);
            // Retornar valores por defecto en caso de error
            return {
                total: 0,
                sin_usar: 0,
                usadas: 0,
                porcentaje_sin_usar: 0,
                por_tema: {}
            };
        }
    }

    /**
     * Crea una nueva sesión de juego
     */
    static async crearSesion(
        userId: string,
        temasIds: string[],
        esAleatorio: boolean,
        libro: string,
        capInicio: number,
        capFin: number,
        duracionSegundos: number
    ): Promise<string> {
        try {
            const { data, error } = await supabase
                .from('sesiones_juego')
                .insert({
                    user_id: userId,
                    temas_ids: temasIds,
                    es_aleatorio: esAleatorio,
                    libro: libro,
                    capitulo_inicio: capInicio,
                    capitulo_fin: capFin,
                    duracion_segundos: duracionSegundos,
                    fecha_inicio: new Date().toISOString()
                })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error('Error creando sesión:', error);
            throw error;
        }
    }

    /**
     * Actualiza una sesión de juego al finalizar
     */
    static async finalizarSesion(
        sesionId: string,
        totalPreguntasMostradas: number,
        totalCorrectas: number,
        totalPasadas: number
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('sesiones_juego')
                .update({
                    total_preguntas_mostradas: totalPreguntasMostradas,
                    total_correctas: totalCorrectas,
                    total_pasadas: totalPasadas,
                    fecha_fin: new Date().toISOString(),
                    completada: true
                })
                .eq('id', sesionId);

            if (error) throw error;
        } catch (error) {
            console.error('Error finalizando sesión:', error);
            throw error;
        }
    }

    /**
     * Registra un resultado individual
     */
    static async registrarResultado(
        sesionId: string,
        preguntaId: string,
        correcta: boolean,
        tiempoRespuestaMs: number | null
    ): Promise<void> {
        try {
            const { error } = await supabase.from('resultados').insert({
                sesion_id: sesionId,
                pregunta_id: preguntaId,
                correcta: correcta,
                tiempo_respuesta_ms: tiempoRespuestaMs
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error registrando resultado:', error);
            // No lanzar error para no interrumpir el juego
        }
    }

    /**
     * Registra una pregunta como usada
     */
    static async registrarPreguntaUsada(
        userId: string,
        preguntaId: string,
        temaId: string,
        libro: string,
        capInicio: number,
        capFin: number
    ): Promise<void> {
        try {
            const { error } = await supabase.rpc('registrar_pregunta_usada', {
                p_user_id: userId,
                p_pregunta_id: preguntaId,
                p_tema_id: temaId,
                p_libro: libro,
                p_cap_inicio: capInicio,
                p_cap_fin: capFin
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error registrando pregunta usada:', error);
            // No lanzar error para no interrumpir el juego
        }
    }

    /**
     * Obtiene o crea un usuario anónimo
     * Si la autenticación anónima está deshabilitada, genera un UUID válido localmente
     */
    static async obtenerOCrearUsuarioAnonimo(): Promise<string> {
        try {
            // Intentar obtener sesión existente
            const {
                data: { session }
            } = await supabase.auth.getSession();

            if (session?.user) {
                return session.user.id;
            }

            // Si no hay sesión, intentar crear usuario anónimo
            const { data, error } = await supabase.auth.signInAnonymously();

            if (error) {
                // Si falla (ej: anonymous auth deshabilitada), generar UUID local
                console.warn('Autenticación anónima no disponible, usando UUID local');
                throw error;
            }

            return data.user!.id;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);

            // Generar o recuperar un UUID válido desde localStorage
            let userId = localStorage.getItem('local_user_uuid');

            if (!userId) {
                // Generar un UUID v4 válido
                userId = this.generateUUID();
                localStorage.setItem('local_user_uuid', userId);
                console.log('UUID local generado:', userId);
            }

            return userId;
        }
    }

    /**
     * Genera un UUID v4 válido
     * Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     */
    private static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
