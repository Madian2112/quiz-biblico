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
    private audioCtx: AudioContext | null = null;

    // Configuración optimizada basada en testing real
    private isWaitingForNeutral = false; // Nuevo: Esperar a que vuelva a posición neutral

    // Configuración optimizada para "Teléfono en la Frente" (Heads Up style)
    private readonly debounceMs = 1000; // Reducido para mejor respuesta

    // Posición Neutral (Frente): ~90° (Vertical)
    // Hacia Arriba (Correcto): < 65° (Mirando un poco al techo)
    // Hacia Abajo (Pasar): > 100° (Mirando un poco al suelo) o Beta > 140°
    private readonly thresholdUp = 65;
    private readonly thresholdDown = 145;
    private readonly gammaMax = 60; // Más flexible lateralmente

    /**
     * Obtiene o crea el contexto de audio
     */
    private getAudioContext(): AudioContext | null {
        if (!browser) return null;

        if (!this.audioCtx) {
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) {
                    this.audioCtx = new AudioContext();
                }
            } catch (e) {
                console.warn('Error creando AudioContext:', e);
            }
        }
        return this.audioCtx;
    }

    /**
     * Intenta reanudar el contexto de audio (necesario tras interacción de usuario)
     */
    public async resumeAudioContext(): Promise<void> {
        const ctx = this.getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            try {
                await ctx.resume();
                console.log('🔊 AudioContext reanudado');
            } catch (e) {
                console.warn('No se pudo reanudar AudioContext:', e);
            }
        }
    }

    /**
     * Reproduce un tono simple
     */
    private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, type: OscillatorType = 'sine'): void {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = type;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    /**
     * Sonido para respuesta correcta (arriba)
     * Arpegio Mayor Rápido (Tin-tin-tin!)
     */
    public playSoundCorrect(): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            // C5 - E5 - G5 (Do Mayor)
            this.playTone(ctx, 523.25, now, 0.1, 'sine');
            this.playTone(ctx, 659.25, now + 0.1, 0.1, 'sine');
            this.playTone(ctx, 783.99, now + 0.2, 0.2, 'sine');
        } catch (e) { console.warn('Audio error', e); }
    }

    /**
     * Sonido para pasar pregunta (abajo)
     * Sonido descendente "Uh-oh"
     */
    public playSoundSkip(): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            // G4 -> Eb4 (Intervalo menor descendente)
            this.playTone(ctx, 392.00, now, 0.15, 'triangle'); // G4
            this.playTone(ctx, 311.13, now + 0.15, 0.3, 'triangle'); // Eb4
        } catch (e) { console.warn('Audio error', e); }
    }

    /**
     * Sonido de fin de juego (Game Over)
     * Secuencia de "Time's Up"
     */
    public playSoundGameOver(): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            // Secuencia descendente rápida
            this.playTone(ctx, 880, now, 0.1, 'square');
            this.playTone(ctx, 698.46, now + 0.1, 0.1, 'square');
            this.playTone(ctx, 523.25, now + 0.2, 0.4, 'square');
        } catch (e) { console.warn('Audio error', e); }
    }

    /**
     * Vibración háptica
     */
    private vibrate(duration: number): void {
        if (!browser) return;
        try {
            if ('vibrate' in navigator) navigator.vibrate(duration);
        } catch (error) { }
    }

    /**
     * Solicita permisos (requerido en iOS 13+)
     */
    async solicitarPermisos(): Promise<boolean> {
        if (!browser) return false;
        await this.resumeAudioContext();

        try {
            if (typeof DeviceOrientationEvent === 'undefined') {
                this.hasPermission = false;
                return false;
            }

            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const permission = await (DeviceOrientationEvent as any).requestPermission();
                    this.hasPermission = permission === 'granted';
                    return this.hasPermission;
                } catch (error) {
                    this.hasPermission = false;
                    return false;
                }
            }

            this.hasPermission = true;
            return true;
        } catch (error) {
            this.hasPermission = false;
            return false;
        }
    }

    esSoportado(): boolean {
        if (!browser) return false;
        return typeof DeviceOrientationEvent !== 'undefined';
    }

    iniciar(callback: AccelerometerCallback): void {
        if (!browser || !this.esSoportado()) return;

        this.callback = callback;
        this.isActive = true;
        this.lastTriggerTime = 0;
        this.isWaitingForNeutral = false;

        this.resumeAudioContext();
        window.addEventListener('deviceorientation', this.handleOrientation, true);

        console.log('🎮 Modo "Heads Up" Iniciado');
        console.log(`   Neutral: ~90°`);
        console.log(`   Arriba (Correcto): < ${this.thresholdUp}°`);
        console.log(`   Abajo (Pasar): > ${this.thresholdDown}°`);
    }

    detener(): void {
        if (!browser) return;
        this.isActive = false;
        this.callback = null;
        window.removeEventListener('deviceorientation', this.handleOrientation, true);
    }

    private handleOrientation = (event: DeviceOrientationEvent): void => {
        if (!this.isActive || !this.callback) return;

        const { beta, gamma } = event;
        if (beta === null || gamma === null) return;

        const now = Date.now();
        if (now - this.lastTriggerTime < this.debounceMs) return;

        // En Landscape, el eje principal de rotación (arriba/abajo) es GAMMA
        // Beta se mantiene cerca de 0 si el teléfono está nivelado horizontalmente
        const absGamma = Math.abs(gamma);
        const absBeta = Math.abs(beta);

        // Log para debug
        if (import.meta.env.DEV && now % 1000 < 50) {
            console.log(`📱 Landscape - Gamma: ${gamma.toFixed(1)}° (Neutral: ±90), Beta: ${beta.toFixed(1)}°`);
        }

        // Lógica de "Zona Neutral"
        // Esperamos a que el teléfono vuelva a estar vertical (±90°) en la frente
        if (this.isWaitingForNeutral) {
            if (absGamma > 70 && absGamma < 110) {
                this.isWaitingForNeutral = false;
                console.log('✅ Regreso a zona neutral (Vertical)');
            }
            return;
        }

        // DETECCIÓN DE GESTOS (Modo Landscape / Manos en extremos)

        // ARRIBA / CORRECTO (Mirando al techo / Face Up)
        // Gamma se acerca a 0° Y Beta es bajo (no está de cabeza)
        if (absGamma < this.thresholdUp && absBeta < 45) {
            this.lastTriggerTime = now;
            this.isWaitingForNeutral = true;
            console.log(`⬆️ CORRECTO detectado (Gamma: ${gamma.toFixed(1)}°)`);

            this.playSoundCorrect();
            this.vibrate(50);
            this.callback('up');
        }
        // ABAJO / PASAR (Mirando al suelo / Face Down)
        // Gamma se acerca a 180° O Beta se invierte (Face Down)
        // Se añade validación (absBeta < 45) para evitar falsos positivos al mover horizontalmente
        else if ((absGamma > this.thresholdDown && absBeta < 45) || absBeta > 165) {
            this.lastTriggerTime = now;
            this.isWaitingForNeutral = true;
            console.log(`⬇️ PASAR detectado (Gamma: ${gamma.toFixed(1)}°, Beta: ${beta.toFixed(1)}°)`);

            this.playSoundSkip();
            this.vibrate(50);
            this.callback('down');
        }
    };

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
