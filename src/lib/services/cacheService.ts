/**
 * Servicio de caché local usando localStorage
 * Complementa el sistema de tracking de Supabase
 */

interface CacheKey {
    temasIds: string[];
    esAleatorio: boolean;
    libro: string;
    capInicio: number;
    capFin: number;
}

interface CacheData {
    preguntasUsadas: string[]; // IDs de preguntas
    ultimaActualizacion: string;
}

export class CacheService {
    private static readonly CACHE_PREFIX = 'quiz_biblico_cache_';

    /**
     * Genera una clave única para la configuración
     */
    private static generarClave(config: CacheKey): string {
        const temasOrdenados = [...config.temasIds].sort();
        return `${this.CACHE_PREFIX}${temasOrdenados.join(',')}_${config.esAleatorio}_${config.libro}_${config.capInicio}-${config.capFin}`;
    }

    /**
     * Obtiene las preguntas usadas para una configuración
     */
    static obtenerPreguntasUsadas(config: CacheKey): string[] {
        try {
            const clave = this.generarClave(config);
            const dataStr = localStorage.getItem(clave);

            if (!dataStr) return [];

            const data: CacheData = JSON.parse(dataStr);
            return data.preguntasUsadas || [];
        } catch (error) {
            console.error('Error obteniendo caché:', error);
            return [];
        }
    }

    /**
     * Agrega una pregunta al caché de usadas
     */
    static agregarPreguntaUsada(config: CacheKey, preguntaId: string): void {
        try {
            const clave = this.generarClave(config);
            const preguntasUsadas = this.obtenerPreguntasUsadas(config);

            if (!preguntasUsadas.includes(preguntaId)) {
                preguntasUsadas.push(preguntaId);

                const data: CacheData = {
                    preguntasUsadas,
                    ultimaActualizacion: new Date().toISOString()
                };

                localStorage.setItem(clave, JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error guardando en caché:', error);
        }
    }

    /**
     * Limpia el caché de una configuración específica
     */
    static limpiarCache(config: CacheKey): void {
        try {
            const clave = this.generarClave(config);
            localStorage.removeItem(clave);
        } catch (error) {
            console.error('Error limpiando caché:', error);
        }
    }

    /**
     * Limpia todo el caché de preguntas
     */
    static limpiarTodoElCache(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(this.CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error limpiando todo el caché:', error);
        }
    }

    /**
     * Obtiene o genera un ID de usuario local
     * Usa la misma clave que SupabaseService para consistencia
     */
    static obtenerOGenerarUserId(): string {
        try {
            let userId = localStorage.getItem('local_user_uuid');

            if (!userId) {
                // Generar un UUID v4 válido
                userId = this.generateUUID();
                localStorage.setItem('local_user_uuid', userId);
            }

            return userId;
        } catch (error) {
            console.error('Error obteniendo user ID:', error);
            return this.generateUUID();
        }
    }

    /**
     * Establece un ID de usuario (útil cuando se autentica)
     */
    static establecerUserId(userId: string): void {
        try {
            localStorage.setItem('local_user_uuid', userId);
        } catch (error) {
            console.error('Error estableciendo user ID:', error);
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
