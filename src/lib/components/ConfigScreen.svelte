<script lang="ts">
	import { gameStore } from "$lib/stores/gameStore.svelte";
	import { BookOpen, Clock, Sparkles, ChevronDown } from "lucide-svelte";
	import { onMount } from "svelte";

	let cargandoPreguntas = $state(false);

	// Efecto para actualizar preguntas disponibles cuando cambian los filtros
	$effect(() => {
		// Dependencias reactivas
		const deps = [
			gameStore.temasSeleccionados,
			gameStore.esAleatorio,
			gameStore.libroSeleccionado,
			gameStore.capituloInicio,
			gameStore.capituloFin,
		];

		// Actualizar contador
		gameStore.actualizarPreguntasDisponibles();
	});

	function toggleTema(temaId: string) {
		const index = gameStore.temasSeleccionados.indexOf(temaId);
		if (index > -1) {
			gameStore.temasSeleccionados.splice(index, 1);
		} else {
			gameStore.temasSeleccionados.push(temaId);
		}
	}

	function toggleAleatorio() {
		gameStore.esAleatorio = !gameStore.esAleatorio;
		if (gameStore.esAleatorio) {
			gameStore.temasSeleccionados = [];
		}
	}

	function actualizarLibro(event: Event) {
		const select = event.target as HTMLSelectElement;
		gameStore.libroSeleccionado = select.value;

		const libro = gameStore.libros.find((l) => l.nombre === select.value);
		if (libro) {
			gameStore.capituloInicio = 1;
			gameStore.capituloFin = libro.total_capitulos;
		}
	}

	async function iniciarJuego() {
		await gameStore.iniciarJuego();
	}

	const duraciones = [
		{ valor: 30, label: "30 segundos" },
		{ valor: 60, label: "1 minuto" },
		{ valor: 120, label: "2 minutos" },
		{ valor: 180, label: "3 minutos" },
		{ valor: 300, label: "5 minutos" },
	];
</script>

<div class="config-screen">
	<div class="container">
		<div class="header fade-in">
			<h1>Quiz Bíblico</h1>
			<p class="text-secondary">
				Configura tu partida y pon a prueba tu conocimiento
			</p>
		</div>

		<div class="config-grid">
			<!-- Selección de Temas -->
			<div class="card fade-in">
				<div class="card-header">
					<Sparkles size={24} />
					<h3>Temas</h3>
				</div>

				<div class="temas-grid">
					<!-- Opción Aleatorio -->
					<button
						class="tema-card"
						class:selected={gameStore.esAleatorio}
						onclick={toggleAleatorio}
					>
						<div
							class="tema-icon"
							style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"
						>
							<Sparkles size={20} />
						</div>
						<span class="tema-nombre">Aleatorio</span>
					</button>

					<!-- Temas disponibles -->
					{#each gameStore.temas as tema}
						<button
							class="tema-card"
							class:selected={gameStore.temasSeleccionados.includes(
								tema.id,
							)}
							class:disabled={gameStore.esAleatorio}
							onclick={() =>
								!gameStore.esAleatorio && toggleTema(tema.id)}
							disabled={gameStore.esAleatorio}
						>
							<div
								class="tema-icon"
								style="background: {tema.color ||
									'var(--gradient-primary)'};"
							>
								<BookOpen size={20} />
							</div>
							<span class="tema-nombre">{tema.nombre}</span>
						</button>
					{/each}
				</div>

				{#if gameStore.temasSeleccionados.length > 0}
					<p class="text-muted mt-2">
						{gameStore.temasSeleccionados.length} tema{gameStore
							.temasSeleccionados.length > 1
							? "s"
							: ""} seleccionado{gameStore.temasSeleccionados
							.length > 1
							? "s"
							: ""}
					</p>
				{/if}
			</div>

			<!-- Selección de Libro -->
			<div class="card fade-in">
				<div class="card-header">
					<BookOpen size={24} />
					<h3>Libro Bíblico</h3>
				</div>

				<div class="select-wrapper">
					<select
						class="select"
						value={gameStore.libroSeleccionado}
						onchange={actualizarLibro}
					>
						{#each gameStore.libros as libro}
							<option value={libro.nombre}>
								{libro.nombre} ({libro.testamento})
							</option>
						{/each}
					</select>
					<ChevronDown class="select-icon" size={20} />
				</div>
			</div>

			<!-- Rango de Capítulos -->
			<div class="card fade-in">
				<div class="card-header">
					<BookOpen size={24} />
					<h3>Capítulos</h3>
				</div>

				<div class="capitulos-grid">
					<div>
						<label for="cap-inicio" class="label">Desde</label>
						<input
							id="cap-inicio"
							type="number"
							class="input"
							min="1"
							max={gameStore.libroSeleccionadoData
								?.total_capitulos || 1}
							bind:value={gameStore.capituloInicio}
						/>
					</div>
					<div>
						<label for="cap-fin" class="label">Hasta</label>
						<input
							id="cap-fin"
							type="number"
							class="input"
							min={gameStore.capituloInicio}
							max={gameStore.libroSeleccionadoData
								?.total_capitulos || 1}
							bind:value={gameStore.capituloFin}
						/>
					</div>
				</div>

				<p class="text-muted mt-2">
					{gameStore.capituloFin - gameStore.capituloInicio + 1} capítulo{gameStore.capituloFin -
						gameStore.capituloInicio >
					0
						? "s"
						: ""}
				</p>
			</div>

			<!-- Duración -->
			<div class="card fade-in">
				<div class="card-header">
					<Clock size={24} />
					<h3>Duración</h3>
				</div>

				<div class="duraciones-grid">
					{#each duraciones as duracion}
						<button
							class="duracion-card"
							class:selected={gameStore.duracionSegundos ===
								duracion.valor}
							onclick={() =>
								(gameStore.duracionSegundos = duracion.valor)}
						>
							{duracion.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Información de preguntas disponibles -->
		<div class="preguntas-info card-glass card fade-in">
			<div class="preguntas-stats-simple">
				<div class="stat-simple">
					<span class="stat-value-large"
						>{gameStore.preguntasDisponibles.total}</span
					>
					<span class="stat-label">Preguntas Disponibles</span>
				</div>
			</div>
		</div>

		<!-- Botón de inicio -->
		<div class="actions fade-in">
			{#if gameStore.error}
				<p class="error-message">{gameStore.error}</p>
			{/if}

			<button
				class="btn btn-primary btn-lg w-full"
				onclick={iniciarJuego}
				disabled={gameStore.cargando ||
					gameStore.preguntasDisponibles.total === 0 ||
					(gameStore.temasSeleccionados.length === 0 &&
						!gameStore.esAleatorio)}
			>
				{#if gameStore.cargando}
					Cargando...
				{:else}
					Iniciar Juego
				{/if}
			</button>

			{#if gameStore.temasSeleccionados.length === 0 && !gameStore.esAleatorio}
				<p class="text-muted text-center">
					Selecciona al menos un tema o activa modo aleatorio
				</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.config-screen {
		min-height: 100vh;
		padding: var(--spacing-xl) 0;
	}

	.header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
	}

	.header h1 {
		margin-bottom: var(--spacing-sm);
	}

	.config-grid {
		display: grid;
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
	}

	.card-header h3 {
		margin: 0;
		font-size: 1.25rem;
	}

	/* Temas */
	.temas-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--spacing-md);
	}

	.tema-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg);
		background: var(--color-bg-tertiary);
		border: 2px solid rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.tema-card:hover:not(:disabled) {
		transform: translateY(-4px);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.tema-card.selected {
		border-color: var(--color-accent-primary);
		background: rgba(102, 126, 234, 0.1);
	}

	.tema-card.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.tema-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.tema-nombre {
		font-size: 0.875rem;
		font-weight: 600;
		text-align: center;
	}

	/* Select */
	.select-wrapper {
		position: relative;
	}

	.select-wrapper :global(.select-icon) {
		position: absolute;
		right: var(--spacing-md);
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--color-text-secondary);
	}

	/* Capítulos */
	.capitulos-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.label {
		display: block;
		margin-bottom: var(--spacing-sm);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	/* Duraciones */
	.duraciones-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--spacing-md);
	}

	.duracion-card {
		padding: var(--spacing-md);
		background: var(--color-bg-tertiary);
		border: 2px solid rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-normal);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.duracion-card:hover {
		border-color: rgba(255, 255, 255, 0.1);
	}

	.duracion-card.selected {
		border-color: var(--color-accent-primary);
		background: rgba(102, 126, 234, 0.1);
	}

	/* Preguntas info */
	.preguntas-info {
		margin-bottom: var(--spacing-xl);
	}

	.preguntas-stats-simple {
		display: flex;
		justify-content: center;
		padding: var(--spacing-lg) 0;
	}

	.stat-simple {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.stat-value-large {
		font-size: 3rem;
		font-weight: 800;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stat-label {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	/* Actions */
	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.error-message {
		padding: var(--spacing-md);
		background: rgba(255, 106, 0, 0.1);
		border: 1px solid var(--color-danger);
		border-radius: var(--radius-md);
		color: var(--color-danger);
		text-align: center;
	}

	@media (max-width: 768px) {
		.temas-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}

		.preguntas-stats {
			gap: var(--spacing-md);
		}

		.stat-value {
			font-size: 1.5rem;
		}
	}
</style>
