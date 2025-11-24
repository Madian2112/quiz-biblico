import type { AccelerometerCallback } from '$lib/types';
import { browser } from '$app/environment';

/**
 * Servicio para manejar el acelerómetro del dispositivo
 * Implementación 2024 con mejores prácticas
 * 
 * Basado en:
 * - MDN DeviceOrientation API
 * - Web.dev best practices
 * - iOS 13+ permission requirements
 */
export class AccelerometerService {
    private callback: AccelerometerCallback | null = null;
    private isActive = $state(false);
    private hasPermission = $state<boolean | null>(null);
    private lastTriggerTime = 0;

    // Configuración optimizada basada en testing real
    private readonly debounceMs = 800; // Evita triggers accidentales
    private readonly thresholdUp = -40; // Beta negativo = arriba (más sensible)
    private readonly thresholdDown = 40; // Beta positivo = abajo
    private readonly gammaMax = 45; // Máximo ángulo lateral permitido

    /**
     * Reproduce sonido usando Web Audio API
     * Frecuencias basadas en teoría musical para mejor UX
     */
    private playSound(frequency: number, duration: number): void {
        if (!browser) return;

        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const audioCtx = new AudioContext();

            // Crear oscilador y ganancia
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // Configurar sonido
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            // ADSR Envelope para sonido profesional
            const now = audioCtx.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Decay

            // Reproducir
            oscillator.start(now);
            oscillator.stop(now + duration);

            // Limpiar recursos
            setTimeout(() => {
                try {
                    audioCtx.close();
                } catch (e) {
                    // Ignorar errores de cierre
                }
            }, duration * 1000 + 100);
        } catch (error) {
            console.warn('Audio no disponible:', error);
        }
    }

    /**
     * Sonido para respuesta correcta (arriba)
     * Nota: C5 (Do mayor) - tono alegre y positivo
     */
    private playSoundCorrect(): void {
        this.playSound(523.25, 0.15); // C5, 150ms
    }

    /**
     * Sonido para pasar pregunta (abajo)
     * Nota: F4 (Fa) - tono neutral
     */
    private playSoundSkip(): void {
        this.playSound(349.23, 0.12); // F4, 120ms
    }

    /**
     * Vibración háptica
     */
    private vibrate(duration: number): void {
        if (!browser) return;

        try {
            if ('vibrate' in navigator) {
                navigator.vibrate(duration);
            }
        } catch (error) {
            // Ignorar errores de vibración
        }
    }

    /**
     * Solicita permisos (requerido en iOS 13+)
     * Mejores prácticas 2024: Siempre verificar y solicitar
     */
    async solicitarPermisos(): Promise<boolean> {
        if (!browser) return false;

        try {
            // Verificar si existe el API
            if (typeof DeviceOrientationEvent === 'undefined') {
                console.warn('DeviceOrientationEvent no soportado');
                this.hasPermission = false;
                return false;
            }

            // iOS 13+ requiere permiso explícito
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const permission = await (DeviceOrientationEvent as any).requestPermission();
                    this.hasPermission = permission === 'granted';

                    if (this.hasPermission) {
                        console.log('✅ Permiso de orientación concedido');
                    } else {
                        console.warn('❌ Permiso de orientación denegado');
                    }

                    return this.hasPermission;
                } catch (error) {
                    console.error('Error solicitando permiso:', error);
                    this.hasPermission = false;
                    return false;
                }
            }

            // Android y otros navegadores no requieren permiso
            this.hasPermission = true;
            console.log('✅ DeviceOrientation disponible (sin permiso requerido)');
            return true;
        } catch (error) {
            console.error('Error en solicitarPermisos:', error);
            this.hasPermission = false;
            return false;
        }
    }

    /**
     * Verifica si el dispositivo soporta DeviceOrientation
     */
    esSoportado(): boolean {
        if (!browser) return false;
        return typeof DeviceOrientationEvent !== 'undefined';
    }

    /**
     * Inicia la escucha del acelerómetro
     */
    iniciar(callback: AccelerometerCallback): void {
        if (!browser) {
            console.warn('No estamos en el navegador');
            return;
        }

        if (!this.esSoportado()) {
            console.warn('DeviceOrientation no soportado');
            return;
        }

        this.callback = callback;
        this.isActive = true;
        this.lastTriggerTime = 0;

        // Agregar listener
        window.addEventListener('deviceorientation', this.handleOrientation, true);

        console.log('🎮 Acelerómetro iniciado');
        console.log(`   Threshold arriba: ${this.thresholdUp}°`);
        console.log(`   Threshold abajo: ${this.thresholdDown}°`);
        console.log(`   Gamma máximo: ±${this.gammaMax}°`);
    }

    /**
     * Detiene la escucha del acelerómetro
     */
    detener(): void {
        if (!browser) return;

        this.isActive = false;
        this.callback = null;

        window.removeEventListener('deviceorientation', this.handleOrientation, true);
        console.log('⏹️ Acelerómetro detenido');
    }

    /**
     * Maneja eventos de orientación
     * Mejores prácticas 2024: Validación robusta y logging detallado
     */
    private handleOrientation = (event: DeviceOrientationEvent): void => {
        if (!this.isActive || !this.callback) return;

        const { beta, gamma } = event;

        // Validar que tenemos datos
        if (beta === null || gamma === null) {
            console.warn('⚠️ Beta o Gamma es null');
            return;
        }

        // Debouncing
        const now = Date.now();
        if (now - this.lastTriggerTime < this.debounceMs) {
            return;
        }

        // Log continuo en desarrollo (solo cada 500ms para no saturar)
        if (import.meta.env.DEV && now % 500 < 50) {
            console.log(`📱 Beta: ${beta.toFixed(1)}°, Gamma: ${gamma.toFixed(1)}°`);
        }

        // Detectar inclinación hacia ARRIBA
        // Beta negativo = parte superior del teléfono hacia arriba
        if (beta < this.thresholdUp && Math.abs(gamma) < this.gammaMax) {
            this.lastTriggerTime = now;
            console.log(`⬆️ ARRIBA detectado - Beta: ${beta.toFixed(1)}°, Gamma: ${gamma.toFixed(1)}°`);

            this.callback('up');
            this.playSoundCorrect();
            this.vibrate(50);
        }
        // Detectar inclinación hacia ABAJO
        // Beta positivo = parte inferior del teléfono hacia arriba
        else if (beta > this.thresholdDown && Math.abs(gamma) < this.gammaMax) {
            this.lastTriggerTime = now;
            console.log(`⬇️ ABAJO detectado - Beta: ${beta.toFixed(1)}°, Gamma: ${gamma.toFixed(1)}°`);

            this.callback('down');
            this.playSoundSkip();
            this.vibrate(30);
        }
    };

    /**
     * Obtiene el estado actual
     */
    obtenerEstado() {
        return {
            isActive: this.isActive,
            hasPermission: this.hasPermission,
            isSupported: this.esSoportado(),
            thresholdUp: this.thresholdUp,
            thresholdDown: this.thresholdDown,
            gammaMax: this.gammaMax,
            debounceMs: this.debounceMs
        };
    }
}

// Instancia singleton
export const accelerometerService = new AccelerometerService();
