<script lang="ts">
	import { onMount } from 'svelte';
	import { addDaysIso } from '$lib/date/iso';
	import type { PlannerAllDayEvent, PlannerCalendar } from '$lib/types/planner';

	type Props = {
		event: PlannerAllDayEvent | null;
		calendars: PlannerCalendar[];
		onClose: () => void;
	};

	let { event, calendars, onClose }: Props = $props();
	let modalEl = $state<HTMLDivElement | null>(null);

	function endInclusive(ev: PlannerAllDayEvent): string {
		// Google all-day events use exclusive end date
		return addDaysIso(ev.endDateExclusive, -1);
	}

	function onKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Escape') onClose();
	}

	onMount(() => {
		// Focus the dialog so Escape works immediately.
		modalEl?.focus();
	});

	$effect(() => {
		if (!event) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});

	function calendarsFor(ev: PlannerAllDayEvent): PlannerCalendar[] {
		const ids = new Set((ev.sources ?? []).map((s) => s.calendarId));
		return calendars.filter((c) => ids.has(c.id));
	}
</script>

{#if event}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onkeydown={onKeyDown}
		onclick={(e) => {
			// Only close when the overlay itself is clicked (not the dialog contents).
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-label="Event details"
			tabindex="-1"
			bind:this={modalEl}
			onkeydown={onKeyDown}
		>
			<div class="top">
				<div class="title" title={event.title}>{event.title}</div>
				<button class="close" type="button" onclick={onClose} aria-label="Close">×</button>
			</div>

			<div class="meta">
				<div class="row">
					<span class="k">Date</span>
					<span class="v">{event.startDate} → {endInclusive(event)}</span>
				</div>
				<div class="row">
					<span class="k">Calendars</span>
					<span class="v">
						{#each calendarsFor(event) as cal (cal.id)}
							<span class="calItem">
								<span class="swatch" style={`background:${cal.backgroundColor};`}></span>
								{cal.title}
							</span>
						{/each}
					</span>
				</div>
				{#if event.location}
					<div class="row">
						<span class="k">Location</span>
						<span class="v">{event.location}</span>
					</div>
				{/if}
				{#if event.htmlLink}
					<div class="row">
						<span class="k">Link</span>
						<span class="v"><a href={event.htmlLink} target="_blank" rel="noreferrer">Open in Google Calendar</a></span>
					</div>
				{/if}
			</div>

			{#if event.description}
				<pre class="desc">{event.description}</pre>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: var(--overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 18px;
		z-index: 50;
	}
	.modal {
		width: min(720px, 95vw);
		max-height: min(80vh, 720px);
		overflow: auto;
		background: var(--panel);
		border-radius: 14px;
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
		padding: 14px 14px 12px;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		color: var(--text);
	}
	.top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 10px;
	}
	.title {
		font-size: 16px;
		font-weight: 650;
		line-height: 1.2;
		word-break: break-word;
	}
	.close {
		border: 1px solid var(--border);
		background: var(--panel);
		color: var(--text);
		border-radius: 10px;
		width: 34px;
		height: 34px;
		font-size: 18px;
		cursor: pointer;
	}
	.meta {
		display: grid;
		gap: 8px;
		margin-bottom: 10px;
	}
	.row {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 10px;
		align-items: start;
	}
	.k {
		color: var(--muted);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.v {
		color: var(--text);
		font-size: 13px;
	}
	.v a {
		color: inherit;
	}
	.swatch {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 999px;
		margin-right: 6px;
		vertical-align: middle;
	}
	.calItem {
		display: inline-flex;
		align-items: center;
		margin-right: 10px;
	}
	.desc {
		white-space: pre-wrap;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 12px;
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 10px;
		margin: 0;
	}
</style>

