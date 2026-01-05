<script lang="ts">
	type Props = {
		title: string;
		dateRange: string;
		x: number;
		y: number;
	};

	let { title, dateRange, x, y }: Props = $props();
</script>

<div class="tooltip" style={`left:${x}px; top:${y}px;`}>
	<div class="ttTitle">{title}</div>
	<div class="ttMeta">{dateRange}</div>
</div>

<style>
	.tooltip {
		position: fixed;
		z-index: 40;
		width: min(360px, calc(100vw - 28px));
		background: var(--panel);
		color: var(--text);
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
		border-radius: 12px;
		padding: 10px 12px;
		pointer-events: none;
	}
	.ttTitle {
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
		font-weight: 650;
		line-height: 1.2;
		margin-bottom: 4px;
	}
	.ttMeta {
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 12px;
		color: var(--muted);
	}
</style>

