<script lang="ts">
	import { gameStore } from "$lib/stores/gameStore.svelte";
	import { accelerometerService } from "$lib/services/accelerometerService.svelte";
	import {
		ArrowUp,
		ArrowDown,
		Timer,
		CheckCircle,
		Smartphone,
	} from "lucide-svelte";
	import { onMount, onDestroy } from "svelte";

	let isLandscape = $state(false);
	let showPermissionRequest = $state(false);
	let usarControlesTactiles = $state(false);
	let animacionDireccion = $state<"up" | "down" | null>(null);

	// Detectar orientación
	function checkOrientation() {
		isLandscape = window.innerWidth > window.innerHeight;
	}

	// Manejar respuesta del acelerómetro
	function handleAccelerometer(direction: "up" | "down") {
		animacionDireccion = direction;

		if (direction === "up") {
			gameStore.responderCorrecto();
		} else {
			gameStore.pasarPregunta();
		}

		// Limpiar animación
		setTimeout(() => {
			animacionDireccion = null;
		}, 300);
	}

	// Controles táctiles
	function handleTactilCorrecto() {
		animacionDireccion = "up";
		gameStore.responderCorrecto();
		setTimeout(() => {
			animacionDireccion = null;
		}, 300);
	}

	function handleTactilPasar() {
		animacionDireccion = "down";
		gameStore.pasarPregunta();
		setTimeout(() => {
			animacionDireccion = null;
		}, 300);
	}

	// Inicializar acelerómetro
	async function inicializarAcelerometro() {
		if (!accelerometerService.esSoportado()) {
			usarControlesTactiles = true;
			return;
		}

		// Solicitar permisos si es necesario
		const tienePermisos = await accelerometerService.solicitarPermisos();

		if (!tienePermisos) {
			showPermissionRequest = true;
			return;
		}

		// Iniciar escucha
		accelerometerService.iniciar(handleAccelerometer);
	}

	async function solicitarPermisosManualmente() {
		const tienePermisos = await accelerometerService.solicitarPermisos();

		if (tienePermisos) {
			showPermissionRequest = false;
			accelerometerService.iniciar(handleAccelerometer);
		} else {
			usarControlesTactiles = true;
			showPermissionRequest = false;
		}
	}

	function activarControlesTactiles() {
		showPermissionRequest = false;
		usarControlesTactiles = true;
	}

	// Formatear tiempo
	function formatearTiempo(segundos: number): string {
		const mins = Math.floor(segundos / 60);
		const secs = segundos % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	onMount(() => {
		window.scrollTo(0, 0);
		checkOrientation();
		window.addEventListener("resize", checkOrientation);
		inicializarAcelerometro();
	});

	onDestroy(() => {
		window.removeEventListener("resize", checkOrientation);
		accelerometerService.detener();
	});
</script>

<div class="game-screen" class:landscape={isLandscape}>
	{#if !isLandscape}
		<!-- Mensaje de orientación -->
		<div class="orientation-warning">
			<Smartphone size={64} />
			<h2>Voltea tu dispositivo</h2>
			<p>Por favor, gira tu teléfono a modo horizontal para jugar</p>
		</div>
	{:else}
		<!-- Pantalla de juego -->
		<div class="game-container">
			<!-- Header con estadísticas -->
			<div class="game-header">
				<div class="stat-item">
					<Timer size={20} />
					<span class="stat-value"
						>{formatearTiempo(gameStore.tiempoRestante)}</span
					>
				</div>
			</div>

			<!-- Pregunta actual -->
			{#if gameStore.preguntaActual}
				<div
					class="pregunta-container"
					class:animate-up={animacionDireccion === "up"}
					class:animate-down={animacionDireccion === "down"}
				>
					<div class="pregunta-card card-glass">

						<h2 class="pregunta-texto">
							{gameStore.preguntaActual.texto_pregunta}
						</h2>

						<div class="respuesta-container">
							<p class="respuesta-label">Respuesta:</p>
							<p class="respuesta-texto">
								{gameStore.preguntaActual.respuesta_correcta}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Barra de progreso -->
			<div class="progress-container">
				<div class="progress-bar">
					<div
						class="progress-fill"
						style="width: {gameStore.porcentajeCompletado}%"
					></div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal de permisos -->
	{#if showPermissionRequest}
		<div class="modal-overlay">
			<div class="modal card">
				<h3>Permisos de Movimiento</h3>
				<p>
					Para usar el control por inclinación, necesitamos acceso a
					los sensores de movimiento de tu dispositivo.
				</p>
				<div class="modal-actions">
					<button
						class="btn btn-primary"
						onclick={solicitarPermisosManualmente}
					>
						Permitir Acceso
					</button>
					<button
						class="btn btn-outline"
						onclick={activarControlesTactiles}
					>
						Usar Controles Táctiles
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.game-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: var(--spacing-md);
		padding-top: var(--spacing-2xl);
	}

	/* Advertencia de orientación */
	.orientation-warning {
		text-align: center;
		max-width: 400px;
		animation: pulse 2s ease-in-out infinite;
	}

	.orientation-warning :global(svg) {
		color: var(--color-accent-primary);
		margin-bottom: var(--spacing-lg);
	}

	/* Contenedor del juego */
	.game-container {
		width: 100%;
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	/* Header */
	.game-header {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: var(--spacing-md);
		background: var(--color-bg-card);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--color-text-secondary);
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	/* Pregunta */
	.pregunta-container {
		position: relative;
		transition: transform var(--transition-normal);
	}

	.pregunta-container.animate-up {
		animation: slideUp 0.3s ease-out;
	}

	.pregunta-container.animate-down {
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideUp {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
		100% {
			transform: translateY(0);
		}
	}

	@keyframes slideDown {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(20px);
		}
		100% {
			transform: translateY(0);
		}
	}

	.pregunta-card {
		padding: var(--spacing-2xl);
		text-align: center;
	}

	.pregunta-meta {
		display: flex;
		justify-content: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
		flex-wrap: wrap;
	}

	.pregunta-texto {
		font-size: 1.75rem;
		margin-bottom: var(--spacing-xl);
		line-height: 1.4;
	}

	.respuesta-container {
		margin-top: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: rgba(102, 126, 234, 0.1);
		border-radius: var(--radius-lg);
		border: 2px solid rgba(102, 126, 234, 0.2);
	}

	.respuesta-label {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-muted);
		margin-bottom: var(--spacing-sm);
	}

	.respuesta-texto {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-accent-primary);
		margin: 0;
	}

	/* Indicadores de dirección */
	.direccion-indicadores {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		display: flex;
		justify-content: space-between;
		padding: var(--spacing-xl);
	}

	.indicador {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		opacity: 0.2;
		transition: all var(--transition-fast);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.indicador.active {
		opacity: 1;
		transform: scale(1.5);
		filter: drop-shadow(0 0 20px currentColor);
	}

	.indicador-arriba {
		color: var(--color-success);
	}

	.indicador-arriba.active {
		animation: pulseGreen 0.3s ease-out;
	}

	.indicador-abajo {
		color: var(--color-danger);
	}

	.indicador-abajo.active {
		animation: pulseRed 0.3s ease-out;
	}

	@keyframes pulseGreen {
		0%,
		100% {
			filter: drop-shadow(0 0 10px var(--color-success));
		}
		50% {
			filter: drop-shadow(0 0 30px var(--color-success));
		}
	}

	@keyframes pulseRed {
		0%,
		100% {
			filter: drop-shadow(0 0 10px var(--color-danger));
		}
		50% {
			filter: drop-shadow(0 0 30px var(--color-danger));
		}
	}

	/* Controles táctiles */
	.controles-tactiles {
		display: flex;
		gap: var(--spacing-lg);
		justify-content: center;
	}

	.btn-tactil {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xl);
		border: none;
		border-radius: var(--radius-xl);
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all var(--transition-normal);
		min-width: 150px;
	}

	.btn-correcto {
		background: var(--gradient-success);
		color: white;
		box-shadow: var(--shadow-lg);
	}

	.btn-correcto:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}

	.btn-pasar {
		background: var(--gradient-danger);
		color: white;
		box-shadow: var(--shadow-lg);
	}

	.btn-pasar:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}

	/* Instrucciones */
	.instrucciones {
		text-align: center;
		padding: var(--spacing-md);
		background: rgba(102, 126, 234, 0.1);
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	/* Barra de progreso */
	.progress-container {
		margin-top: auto;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--gradient-primary);
		transition: width 1s linear;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--spacing-md);
	}

	.modal {
		max-width: 500px;
		width: 100%;
	}

	.modal h3 {
		margin-bottom: var(--spacing-md);
	}

	.modal p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.modal-actions {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	@media (max-width: 768px) and (orientation: landscape) {
		.game-header {
			padding: var(--spacing-sm);
		}

		.stat-value {
			font-size: 1rem;
		}

		.pregunta-card {
			padding: var(--spacing-lg);
		}

		.pregunta-texto {
			font-size: 1.25rem;
		}

		.respuesta-texto {
			font-size: 1rem;
		}
	}
</style>
