<script lang="ts">
	import { gameStore } from '$lib/stores/gameStore.svelte';
	import ConfigScreen from '$lib/components/ConfigScreen.svelte';
	import GameScreen from '$lib/components/GameScreen.svelte';
	import ResultsScreen from '$lib/components/ResultsScreen.svelte';
	import { onMount, onDestroy } from 'svelte';

	onMount(async () => {
		await gameStore.inicializar();
	});

	onDestroy(() => {
		gameStore.destruir();
	});
</script>

{#if gameStore.cargando && gameStore.temas.length === 0}
	<div class="loading-screen">
		<div class="loader"></div>
		<p>Cargando...</p>
	</div>
{:else if gameStore.estado === 'configuracion'}
	<ConfigScreen />
{:else if gameStore.estado === 'jugando'}
	<GameScreen />
{:else if gameStore.estado === 'resultados'}
	<ResultsScreen />
{/if}

<style>
	.loading-screen {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-lg);
	}

	.loader {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-bg-tertiary);
		border-top-color: var(--color-accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-screen p {
		color: var(--color-text-secondary);
		font-size: 1.125rem;
	}
</style>
