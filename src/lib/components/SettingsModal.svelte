<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import type { PlannerCalendar } from '$lib/types/planner';

	type LayoutMode = 'dates' | 'week' | 'vertical';
	type ThemeMode = 'system' | 'light' | 'dark';
	type WeekStartMode = 0 | 1 | 6; // Sun | Mon | Sat

	type Props = {
		open: boolean;
		hideBirthdays: boolean;
		eventRowsPerMonth: number;
		layoutMode: LayoutMode;
		themeMode: ThemeMode;
		weekStart: WeekStartMode;
		calendars: PlannerCalendar[];
		selectedCalendarIds: Set<string>;
		isSignedIn: boolean;
		onChange: (next: {
			hideBirthdays: boolean;
			eventRowsPerMonth: number;
			layoutMode: LayoutMode;
			themeMode: ThemeMode;
			weekStart: WeekStartMode;
		}) => void;
		onToggleCalendar: (id: string) => void;
		onSignOut: () => Promise<void>;
		onClose: () => void;
	};

	let {
		open,
		hideBirthdays,
		eventRowsPerMonth,
		layoutMode,
		themeMode,
		weekStart,
		calendars,
		selectedCalendarIds,
		isSignedIn,
		onChange,
		onToggleCalendar,
		onSignOut,
		onClose
	}: Props = $props();
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
			weekStart: WeekStartMode;
		}>
	): void {
		onChange({
			hideBirthdays: partial.hideBirthdays ?? hideBirthdays,
			eventRowsPerMonth: partial.eventRowsPerMonth ?? eventRowsPerMonth,
			layoutMode: partial.layoutMode ?? layoutMode,
			themeMode: partial.themeMode ?? themeMode,
			weekStart: partial.weekStart ?? weekStart
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
				{#if calendars.length > 0}
					<div class="row" style="align-items: flex-start;">
						<div class="label" style="padding-top: 2px;">Calendars</div>
						<div class="calList">
							{#each calendars as cal (cal.id)}
								<label class="cal">
									<input
										type="checkbox"
										checked={selectedCalendarIds.has(cal.id)}
										onchange={() => onToggleCalendar(cal.id)}
									/>
									<span class="swatch" style={`background:${cal.backgroundColor};`}></span>
									<span class="name">{cal.title}</span>
									{#if cal.primary}
										<span class="tag">primary</span>
									{/if}
								</label>
							{/each}
						</div>
					</div>
				{/if}

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
						<label class="radio">
							<input
								type="radio"
								name="layout"
								checked={layoutMode === 'vertical'}
								onchange={() => update({ layoutMode: 'vertical' })}
							/>
							<span>Vertical</span>
						</label>
					</div>
				</div>

				{#if layoutMode === 'vertical'}
					<div class="row">
						<div class="label">Week Start</div>
						<div class="choices">
							<label class="radio">
								<input
									type="radio"
									name="weekStart"
									checked={weekStart === 0}
									onchange={() => update({ weekStart: 0 })}
								/>
								<span>Sunday</span>
							</label>
							<label class="radio">
								<input
									type="radio"
									name="weekStart"
									checked={weekStart === 1}
									onchange={() => update({ weekStart: 1 })}
								/>
								<span>Monday</span>
							</label>
							<label class="radio">
								<input
									type="radio"
									name="weekStart"
									checked={weekStart === 6}
									onchange={() => update({ weekStart: 6 })}
								/>
								<span>Saturday</span>
							</label>
						</div>
					</div>
				{/if}

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

				{#if isSignedIn}
					<div class="row" style="margin-top: 10px;">
						<div class="label">Account</div>
						<button class="signOut" onclick={() => void onSignOut()}>Sign out</button>
					</div>
				{/if}

				<div class="row" style="margin-top: 10px;">
					<div class="label">Legal</div>
					<div class="choices">
						<a href="{base}/privacy" class="link">Privacy</a>
						<a href="{base}/terms" class="link">Terms</a>
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
		overflow-y: auto;
	}
	@media (max-width: 600px) {
		.overlay {
			padding: 12px;
			align-items: flex-start;
		}
	}
	.modal {
		width: min(560px, calc(100vw - 36px));
		max-width: 100%;
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
		flex-shrink: 0;
	}
	.section {
		display: grid;
		gap: 12px;
	}
	.row {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: 10px;
		align-items: start;
	}
	@media (max-width: 600px) {
		.row {
			grid-template-columns: 1fr;
			gap: 8px;
		}
		.label {
			margin-bottom: 4px;
		}
	}
	.pref {
		grid-column: 1 / -1;
		display: inline-flex;
		gap: 10px;
		align-items: center;
		font-size: 13px;
		min-width: 0;
	}
	.pref span {
		flex-shrink: 1;
		min-width: 0;
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
	@media (max-width: 600px) {
		.choices {
			gap: 10px;
		}
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
	.link {
		color: var(--focus);
		text-decoration: none;
		font-size: 13px;
	}
	.link:hover {
		text-decoration: underline;
	}
	.calList {
		display: grid;
		gap: 6px;
		min-width: 0;
	}
	.cal {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
		min-width: 0;
	}
	.swatch {
		width: 10px;
		height: 10px;
		border-radius: 999px;
		flex-shrink: 0;
	}
	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
		flex: 1;
	}
	.tag {
		margin-left: auto;
		font-size: 11px;
		color: var(--muted);
		border: 1px solid var(--border);
		padding: 2px 6px;
		border-radius: 999px;
	}
	.signOut {
		padding: 7px 10px;
		border-radius: 8px;
		border: 1px solid var(--btn-secondary-border);
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
		cursor: pointer;
	}
	.signOut:hover {
		opacity: 0.8;
	}
</style>

