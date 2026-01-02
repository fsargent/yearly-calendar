<script lang="ts">
	import { onMount } from 'svelte';

	type LayoutMode = 'dates' | 'week';
	type ThemeMode = 'system' | 'light' | 'dark';

	type Props = {
		open: boolean;
		hideBirthdays: boolean;
		eventRowsPerMonth: number;
		layoutMode: LayoutMode;
		themeMode: ThemeMode;
		onChange: (next: {
			hideBirthdays: boolean;
			eventRowsPerMonth: number;
			layoutMode: LayoutMode;
			themeMode: ThemeMode;
		}) => void;
		onClose: () => void;
	};

	let { open, hideBirthdays, eventRowsPerMonth, layoutMode, themeMode, onChange, onClose }: Props = $props();
	let modalEl = $state<HTMLDivElement | null>(null);

	function onKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Escape') onClose();
	}

	onMount(() => {
		if (open) modalEl?.focus();
	});

	$effect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});

	function update(
		partial: Partial<{
			hideBirthdays: boolean;
			eventRowsPerMonth: number;
			layoutMode: LayoutMode;
			themeMode: ThemeMode;
		}>
	): void {
		onChange({
			hideBirthdays: partial.hideBirthdays ?? hideBirthdays,
			eventRowsPerMonth: partial.eventRowsPerMonth ?? eventRowsPerMonth,
			layoutMode: partial.layoutMode ?? layoutMode,
			themeMode: partial.themeMode ?? themeMode
		});
	}
</script>

{#if open}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onkeydown={onKeyDown}
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div class="modal" role="dialog" aria-modal="true" aria-label="Settings" tabindex="-1" bind:this={modalEl} onkeydown={onKeyDown}>
			<div class="top">
				<div class="title">Settings</div>
				<button class="close" type="button" onclick={onClose} aria-label="Close">×</button>
			</div>

			<div class="section">
				<div class="row">
					<label class="pref">
						<input
							type="checkbox"
							checked={hideBirthdays}
							onchange={() => update({ hideBirthdays: !hideBirthdays })}
						/>
						<span>Hide birthdays</span>
					</label>
				</div>

				<div class="row">
					<label class="pref">
						<span>Event rows per month</span>
						<input
							class="num"
							type="number"
							min="1"
							max="10"
							value={eventRowsPerMonth}
							onchange={(e) => {
								const val = Number((e.currentTarget as HTMLInputElement).value);
								const next = Number.isFinite(val) ? Math.max(1, Math.min(10, val)) : 3;
								update({ eventRowsPerMonth: next });
							}}
						/>
					</label>
				</div>

				<div class="row">
					<div class="label">Layout</div>
					<div class="choices">
						<label class="radio">
							<input
								type="radio"
								name="layout"
								checked={layoutMode === 'dates'}
								onchange={() => update({ layoutMode: 'dates' })}
							/>
							<span>1st aligned</span>
						</label>
						<label class="radio">
							<input
								type="radio"
								name="layout"
								checked={layoutMode === 'week'}
								onchange={() => update({ layoutMode: 'week' })}
							/>
							<span>Week aligned</span>
						</label>
					</div>
				</div>

				<div class="row">
					<div class="label">Theme</div>
					<div class="choices">
						<label class="radio">
							<input
								type="radio"
								name="theme"
								checked={themeMode === 'system'}
								onchange={() => update({ themeMode: 'system' })}
							/>
							<span>System</span>
						</label>
						<label class="radio">
							<input
								type="radio"
								name="theme"
								checked={themeMode === 'light'}
								onchange={() => update({ themeMode: 'light' })}
							/>
							<span>Light</span>
						</label>
						<label class="radio">
							<input
								type="radio"
								name="theme"
								checked={themeMode === 'dark'}
								onchange={() => update({ themeMode: 'dark' })}
							/>
							<span>Dark</span>
						</label>
					</div>
				</div>
			</div>
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
		z-index: 60;
	}
	.modal {
		width: min(560px, 95vw);
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
	.section {
		display: grid;
		gap: 12px;
	}
	.row {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: 10px;
		align-items: center;
	}
	.pref {
		grid-column: 1 / -1;
		display: inline-flex;
		gap: 10px;
		align-items: center;
		font-size: 13px;
	}
	.label {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--muted);
	}
	.choices {
		display: flex;
		gap: 14px;
		align-items: center;
		flex-wrap: wrap;
	}
	.radio {
		display: inline-flex;
		gap: 8px;
		align-items: center;
		font-size: 13px;
	}
	.num {
		width: 70px;
		padding: 6px 8px;
		border: 1px solid var(--border);
		background: var(--panel);
		color: var(--text);
		border-radius: 8px;
	}
</style>

