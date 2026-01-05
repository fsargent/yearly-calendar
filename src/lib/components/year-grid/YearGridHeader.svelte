<script lang="ts">
	type Props = {
		mode: 'dates' | 'week' | 'vertical';
		weekStartDay: number;
	};

	let { mode, weekStartDay }: Props = $props();
</script>

<div class="headerRow">
	<div class="hLabel"></div>
	{#if mode === 'week'}
		{#each Array.from({ length: 6 }, (_, w) => w) as w}
			<div class="hWeek" style={`grid-column:${2 + w * 7} / ${2 + (w + 1) * 7};`}>W{w + 1}</div>
		{/each}
		{#each Array.from({ length: 42 }, (_, i) => i) as i}
			<div class="hDay" style={`grid-row:2;`}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i % 7]}</div>
		{/each}
	{:else if mode === 'vertical'}
		{#each Array.from({ length: 7 }, (_, i) => i) as i}
			<div class="hDay" style={`grid-row:2;`}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][(i + weekStartDay) % 7]}</div>
		{/each}
	{:else}
		{#each Array.from({ length: 31 }, (_, i) => i + 1) as day}
			<div class="hDay">{day}</div>
		{/each}
	{/if}
</div>

<style>
	.headerRow {
		display: grid;
		grid-template-columns: 72px repeat(var(--col-count), minmax(var(--cell-min), 1fr));
		grid-template-rows: 16px 20px;
		align-items: end;
		gap: 0;
		margin-bottom: 6px;
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg);
		/* keep header readable over bars while scrolling */
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
	}
	.hLabel {
		height: 20px;
		grid-row: 1 / -1;
	}
	.hDay {
		background: var(--bg);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 10px;
		color: var(--muted);
		text-align: center;
		padding-bottom: 2px;
		border-bottom: 1px solid var(--border);
	}
	.hWeek {
		grid-row: 1;
		background: var(--bg);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 10px;
		color: var(--text);
		text-align: center;
		padding-bottom: 2px;
		border-bottom: 1px solid var(--border);
		opacity: 0.85;
	}
</style>

