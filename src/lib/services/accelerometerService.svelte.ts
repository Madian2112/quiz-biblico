import type { AccelerometerCallback } from '$lib/types';
import { browser } from '$app/environment';

/**
 * Servicio para manejar el acelerómetro del dispositivo
 * Implementación 2024 - MODO LANDSCAPE OPTIMIZADO
 * 
 * Basado en:
 * - MDN DeviceOrientation API
 * - Testing real en landscape con teléfono en la frente
 */
export class AccelerometerService {
    private callback: AccelerometerCallback | null = null;
    private isActive = $state(false);
    private hasPermission = $state<boolean | null>(null);
    private lastTriggerTime = 0;
    private audioCtx: AudioContext | null = null;

    // Sistema de zona neutral
    private isWaitingForNeutral = false;

    // Configuración optimizada para Landscape "Heads Up"
    private readonly debounceMs = 1000;

    // UMBRALES LANDSCAPE (Teléfono en la frente, cámara trasera apuntando a la frente)
    // Neutral: Gamma ≈ ±90°, Beta ≈ 0°
    // PASAR (techo): Gamma < 65° (funciona perfecto)
    // CORRECTO (suelo): Beta > 50° (espejo de PASAR)
    private readonly thresholdGammaDown = 65;  // Para PASAR (hacia techo)
    private readonly thresholdBetaUp = 50;     // Para CORRECTO (hacia suelo)
    private readonly maxBetaForGamma = 55;     // Beta máximo al usar gamma
    private readonly minGammaForBeta = 60;     // Gamma mínimo al usar beta

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
     * Intenta reanudar el contexto de audio
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
     * Sonido para respuesta correcta
     */
    public playSoundCorrect(): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            // Arpegio Mayor C5-E5-G5
            this.playTone(ctx, 523.25, now, 0.1, 'sine');
            this.playTone(ctx, 659.25, now + 0.1, 0.1, 'sine');
            this.playTone(ctx, 783.99, now + 0.2, 0.2, 'sine');
        } catch (e) { console.warn('Audio error', e); }
    }

    /**
     * Sonido para pasar pregunta
     */
    public playSoundSkip(): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            // Sonido descendente G4->Eb4
            this.playTone(ctx, 392.00, now, 0.15, 'triangle');
            this.playTone(ctx, 311.13, now + 0.15, 0.3, 'triangle');
        } catch (e) { console.warn('Audio error', e); }
    }

    /**
     * Sonido de fin de juego
     */
    public playSoundGameOver(): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            this.playTone(ctx, 880, now, 0.1, 'square');
            this.playTone(ctx, 698.46, now + 0.1, 0.1, 'square');
            this.playTone(ctx, 523.25, now + 0.2, 0.4, 'square');
        } catch (e) { console.warn('Audio error', e); }
    }

    /**
     * Sonido para cuenta regresiva
     */
    public playSoundCountdown(isFinal: boolean = false): void {
        if (!browser) return;
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            this.resumeAudioContext();

            const now = ctx.currentTime;
            const freq = isFinal ? 880 : 440;
            const type = isFinal ? 'square' : 'sine';

            this.playTone(ctx, freq, now, 0.1, type);
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
     * Solicita permisos (iOS 13+)
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

        console.log('🎮 Modo "Heads Up" LANDSCAPE Iniciado');
        console.log(`   Neutral: Gamma ≈ ±90°, Beta ≈ 0°`);
        console.log(`   PASAR (techo): Gamma < ${this.thresholdGammaDown}°`);
        console.log(`   CORRECTO (suelo): Beta > ${this.thresholdBetaUp}°`);
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

        const absGamma = Math.abs(gamma);
        const absBeta = Math.abs(beta);

        // Log para debug
        if (import.meta.env.DEV && now % 1000 < 50) {
            console.log(`📱 G: ${gamma.toFixed(1)}° | B: ${beta.toFixed(1)}°`);
        }

        // ZONA NEUTRAL: Esperar a que vuelva a posición vertical
        // Gamma alto (≈90°) y Beta bajo (≈0°)
        if (this.isWaitingForNeutral) {
            if (absGamma > 70 && absGamma <= 90 && absBeta < 30) {
                this.isWaitingForNeutral = false;
                console.log('✅ Zona neutral alcanzada');
            }
            return;
        }

        // ⬆️ PASAR (hacia atrás/techo)
        // Gamma DISMINUYE hacia 0°
        // Beta se mantiene bajo
        // ✅ ESTA CONDICIÓN YA FUNCIONA PERFECTAMENTE
        if (absGamma < this.thresholdGammaDown && absBeta < this.maxBetaForGamma) {
            this.lastTriggerTime = now;
            this.isWaitingForNeutral = true;
            console.log(`⬆️ PASAR - Gamma: ${gamma.toFixed(1)}° (< ${this.thresholdGammaDown}°)`);

            this.playSoundSkip();
            this.vibrate(50);
            this.callback('up');
        }
        // ⬇️ CORRECTO (hacia adelante/suelo)
        // Beta AUMENTA significativamente
        // Gamma se mantiene alto (cerca de 90°)
        // ✅ NUEVA LÓGICA ESPEJO DE LA QUE FUNCIONA
        else if (absBeta > this.thresholdBetaUp && absGamma > this.minGammaForBeta) {
            this.lastTriggerTime = now;
            this.isWaitingForNeutral = true;
            console.log(`⬇️ CORRECTO - Beta: ${beta.toFixed(1)}° (> ${this.thresholdBetaUp}°)`);

            this.playSoundCorrect();
            this.vibrate(50);
            this.callback('down');
        }
    };

    obtenerEstado() {
        return {
            isActive: this.isActive,
            hasPermission: this.hasPermission,
            isSupported: this.esSoportado(),
            thresholdGammaDown: this.thresholdGammaDown,
            thresholdBetaUp: this.thresholdBetaUp,
            maxBetaForGamma: this.maxBetaForGamma,
            minGammaForBeta: this.minGammaForBeta,
            debounceMs: this.debounceMs
        };
    }
}

// Instancia singleton
export const accelerometerService = new AccelerometerService();