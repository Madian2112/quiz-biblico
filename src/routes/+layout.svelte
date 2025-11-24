<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Quiz Bíblico - Pon a prueba tu conocimiento</title>
	<meta name="description" content="Aplicación interactiva de quiz bíblico con control por acelerómetro" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
</svelte:head>

<main>
	{@render children()}
</main>

<style>
	main {
		width: 100%;
		min-height: 100vh;
	}
</style>
