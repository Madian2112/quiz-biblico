// Tipos de base de datos
export interface Tema {
    id: string;
    nombre: string;
    descripcion: string | null;
    icono_clase: string | null;
    color: string | null;
    created_at: string;
}

export interface LibroBiblico {
    id: string;
    nombre: string;
    abreviatura: string | null;
    testamento: 'Antiguo' | 'Nuevo';
    total_capitulos: number;
    orden: number;
    created_at: string;
}

export interface Pregunta {
    id: string;
    tema_id: string;
    libro: string;
    capitulo: number;
    texto_pregunta: string;
    respuesta_correcta: string;
    nivel_dificultad: 'fácil' | 'medio' | 'difícil';
    versiculo_especifico: string | null;
    metadata: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export interface PreguntaConTema extends Pregunta {
    tema_nombre: string;
    veces_usada: number;
}

// Tipos de configuración y juego
export interface ConfiguracionJuego {
    temas_ids: string[];
    es_aleatorio: boolean;
    libro: string;
    capitulo_inicio: number;
    capitulo_fin: number;
    duracion_segundos: number;
}

export interface SesionJuego {
    id: string;
    user_id: string | null;
    temas_ids: string[];
    es_aleatorio: boolean;
    libro: string;
    capitulo_inicio: number;
    capitulo_fin: number;
    duracion_segundos: number;
    total_preguntas_mostradas: number;
    total_correctas: number;
    total_pasadas: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    completada: boolean;
    metadata: Record<string, any> | null;
}

export interface Resultado {
    id: string;
    sesion_id: string;
    pregunta_id: string;
    correcta: boolean;
    tiempo_respuesta_ms: number | null;
    timestamp: string;
}

export interface ResultadoConPregunta extends Resultado {
    pregunta: Pregunta;
}

// Estados de la aplicación
export type EstadoJuego = 'configuracion' | 'jugando' | 'resultados';

export interface PreguntasDisponibles {
    total: number;
    sin_usar: number;
    usadas: number;
    porcentaje_sin_usar: number;
    por_tema: Record<string, number>;
}

// Tipos para el acelerómetro
export interface AccelerometerData {
    beta: number; // Inclinación frontal/trasera (-180 a 180)
    gamma: number; // Inclinación izquierda/derecha (-90 a 90)
    alpha: number; // Rotación (0 a 360)
}

export type AccelerometerCallback = (direction: 'up' | 'down') => void;
