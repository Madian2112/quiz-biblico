<script lang="ts">
	import { gameStore } from '$lib/stores/gameStore.svelte';
	import { Trophy, CheckCircle, XCircle, RotateCcw, Home } from 'lucide-svelte';

	function calcularPorcentaje(): number {
		if (gameStore.totalPreguntasMostradas === 0) return 0;
		return Math.round((gameStore.respuestasCorrectas / gameStore.totalPreguntasMostradas) * 100);
	}

	function obtenerMensaje(): string {
		const porcentaje = calcularPorcentaje();

		if (porcentaje >= 90) return '¡Excelente! Eres un experto bíblico';
		if (porcentaje >= 70) return '¡Muy bien! Buen conocimiento';
		if (porcentaje >= 50) return '¡Bien hecho! Sigue practicando';
		if (porcentaje >= 30) return 'Buen intento, sigue estudiando';
		return 'Sigue adelante, la práctica hace al maestro';
	}

	function volverAJugar() {
		gameStore.volverAConfigurar();
	}
</script>

<div class="results-screen">
	<div class="container">
		<!-- Header con trofeo -->
		<div class="results-header fade-in">
			<div class="trophy-icon">
				<Trophy size={64} />
			</div>
			<h1>¡Ronda Completada!</h1>
			<p class="mensaje">{obtenerMensaje()}</p>
		</div>

		<!-- Estadísticas principales -->
		<div class="stats-grid fade-in">
			<div class="stat-card card">
				<div class="stat-icon success">
					<CheckCircle size={32} />
				</div>
				<div class="stat-content">
					<span class="stat-value">{gameStore.respuestasCorrectas}</span>
					<span class="stat-label">Correctas</span>
				</div>
			</div>

			<div class="stat-card card">
				<div class="stat-icon danger">
					<XCircle size={32} />
				</div>
				<div class="stat-content">
					<span class="stat-value">{gameStore.respuestasPasadas}</span>
					<span class="stat-label">Pasadas</span>
				</div>
			</div>

			<div class="stat-card card">
				<div class="stat-icon primary">
					<Trophy size={32} />
				</div>
				<div class="stat-content">
					<span class="stat-value">{calcularPorcentaje()}%</span>
					<span class="stat-label">Precisión</span>
				</div>
			</div>
		</div>

		<!-- Gráfico circular de progreso -->
		<div class="progress-circle-container card fade-in">
			<div class="progress-circle">
				<svg viewBox="0 0 200 200" class="circle-svg">
					<circle
						cx="100"
						cy="100"
						r="90"
						fill="none"
						stroke="var(--color-bg-tertiary)"
						stroke-width="12"
					/>
					<circle
						cx="100"
						cy="100"
						r="90"
						fill="none"
						stroke="url(#gradient)"
						stroke-width="12"
						stroke-linecap="round"
						stroke-dasharray="565.48"
						stroke-dashoffset={565.48 - (565.48 * calcularPorcentaje()) / 100}
						transform="rotate(-90 100 100)"
					/>
					<defs>
						<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
						</linearGradient>
					</defs>
				</svg>
				<div class="circle-text">
					<span class="circle-percentage">{calcularPorcentaje()}%</span>
					<span class="circle-label">Precisión</span>
				</div>
			</div>
		</div>

		<!-- Historial de preguntas -->
		<div class="historial-container card fade-in">
			<h3>Historial de Preguntas</h3>

			<div class="historial-list">
				{#each gameStore.historial as item, index}
					<div class="historial-item" class:correcta={item.correcta}>
						<div class="item-header">
							<span class="item-numero">#{index + 1}</span>
							<span class="badge" class:badge-success={item.correcta} class:badge-danger={!item.correcta}>
								{item.correcta ? 'Correcta' : 'Pasada'}
							</span>
						</div>

						<div class="item-content">
							<p class="item-pregunta">{item.pregunta.texto_pregunta}</p>
							<p class="item-respuesta">
								<strong>Respuesta:</strong>
								{item.pregunta.respuesta_correcta}
							</p>
							<div class="item-meta">
								<span class="badge badge-primary">{item.pregunta.tema_nombre}</span>
								{#if item.pregunta.versiculo_especifico}
									<span class="text-muted">{item.pregunta.versiculo_especifico}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Acciones -->
		<div class="actions fade-in">
			<button class="btn btn-primary btn-lg" onclick={volverAJugar}>
				<RotateCcw size={20} />
				Jugar de Nuevo
			</button>
		</div>
	</div>
</div>

<style>
	.results-screen {
		min-height: 100vh;
		padding: var(--spacing-xl) 0;
	}

	/* Header */
	.results-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
	}

	.trophy-icon {
		display: inline-flex;
		padding: var(--spacing-lg);
		background: var(--gradient-primary);
		border-radius: 50%;
		margin-bottom: var(--spacing-lg);
		animation: bounce 1s ease-in-out;
	}

	.trophy-icon :global(svg) {
		color: white;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.mensaje {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		margin-top: var(--spacing-md);
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		padding: var(--spacing-xl);
	}

	.stat-icon {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stat-icon.success {
		background: var(--gradient-success);
		color: white;
	}

	.stat-icon.danger {
		background: var(--gradient-danger);
		color: white;
	}

	.stat-icon.primary {
		background: var(--gradient-primary);
		color: white;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Progress Circle */
	.progress-circle-container {
		margin-bottom: var(--spacing-2xl);
		display: flex;
		justify-content: center;
		padding: var(--spacing-2xl);
	}

	.progress-circle {
		position: relative;
		width: 200px;
		height: 200px;
	}

	.circle-svg {
		width: 100%;
		height: 100%;
		transform: scaleX(-1);
	}

	.circle-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.circle-percentage {
		display: block;
		font-size: 3rem;
		font-weight: 800;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.circle-label {
		display: block;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Historial */
	.historial-container {
		margin-bottom: var(--spacing-2xl);
	}

	.historial-container h3 {
		margin-bottom: var(--spacing-lg);
	}

	.historial-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		max-height: 600px;
		overflow-y: auto;
		padding-right: var(--spacing-sm);
	}

	.historial-item {
		padding: var(--spacing-lg);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-lg);
		border-left: 4px solid var(--color-danger);
		transition: all var(--transition-normal);
	}

	.historial-item.correcta {
		border-left-color: var(--color-success);
	}

	.historial-item:hover {
		background: var(--color-bg-secondary);
		transform: translateX(4px);
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.item-numero {
		font-weight: 700;
		color: var(--color-text-muted);
	}

	.item-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.item-pregunta {
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.item-respuesta {
		color: var(--color-text-secondary);
		margin: 0;
		font-size: 0.875rem;
	}

	.item-meta {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
		flex-wrap: wrap;
	}

	/* Actions */
	.actions {
		display: flex;
		justify-content: center;
		gap: var(--spacing-md);
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			padding: var(--spacing-lg);
		}

		.stat-icon {
			width: 48px;
			height: 48px;
		}

		.stat-icon :global(svg) {
			width: 24px;
			height: 24px;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.progress-circle {
			width: 150px;
			height: 150px;
		}

		.circle-percentage {
			font-size: 2rem;
		}

		.historial-list {
			max-height: 400px;
		}
	}
</style>
