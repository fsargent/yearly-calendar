<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import YearGrid from '$lib/components/YearGrid.svelte';
	import EventModal from '$lib/components/EventModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import { createTokenClient, isGoogleGisLoaded, revokeToken } from '$lib/google/gis';
	import { listAllDayEventsForYear, listCalendars } from '$lib/google/calendarApi';
	import { loadJson, saveJson } from '$lib/storage/localStorage';
	import type { PlannerAllDayEvent, PlannerCalendar } from '$lib/types/planner';

	const STORAGE_SELECTED_CALENDARS_KEY = 'yearPlanner:selectedCalendars:v1';
	const STORAGE_HIDE_BIRTHDAYS_KEY = 'yearPlanner:hideBirthdays:v1';
	const STORAGE_EVENT_ROWS_KEY = 'yearPlanner:eventRowsPerMonth:v1';
	const STORAGE_LAYOUT_MODE_KEY = 'yearPlanner:layoutMode:v1';
	const STORAGE_THEME_MODE_KEY = 'yearPlanner:themeMode:v1';
	const SESSION_AUTH_KEY = 'yearPlanner:authSession:v1';

	const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
	const VITE_GOOGLE_SCOPES = (import.meta.env.VITE_GOOGLE_SCOPES as string | undefined) ??
		'https://www.googleapis.com/auth/calendar.readonly';

	let year = new Date().getFullYear();

	let status: 'signed_out' | 'loading_gis' | 'signed_in' | 'error' = 'loading_gis';
	let errorMessage = '';

	let accessToken: string | null = null;
	let calendars: PlannerCalendar[] = [];
	let selectedCalendarIds = new Set<string>();
	let hideBirthdays = false;
	let eventRowsPerMonth = 3;
	let layoutMode: 'dates' | 'week' = 'dates';
	let themeMode: 'system' | 'light' | 'dark' = 'system';
	let syncing = false;

	let allDayEventsRaw: PlannerAllDayEvent[] = [];
	let allDayEvents: PlannerAllDayEvent[] = [];
	let selectedEvent: PlannerAllDayEvent | null = null;
	let settingsOpen = false;

	function setError(message: string): void {
		status = 'error';
		errorMessage = message;
	}

	function loadSelected(): void {
		const saved = loadJson<string[]>(STORAGE_SELECTED_CALENDARS_KEY, []);
		selectedCalendarIds = new Set(saved);
	}

	function persistSelected(): void {
		saveJson(STORAGE_SELECTED_CALENDARS_KEY, Array.from(selectedCalendarIds));
	}

	function toggleCalendar(id: string): void {
		// Svelte reactivity won't track Set mutations, so reassign a new Set.
		const next = new Set(selectedCalendarIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedCalendarIds = next;
		persistSelected();
	}

	function loadPrefs(): void {
		hideBirthdays = loadJson<boolean>(STORAGE_HIDE_BIRTHDAYS_KEY, false);
		eventRowsPerMonth = loadJson<number>(STORAGE_EVENT_ROWS_KEY, 3);
		if (!Number.isFinite(eventRowsPerMonth) || eventRowsPerMonth < 1) eventRowsPerMonth = 3;
		if (eventRowsPerMonth > 10) eventRowsPerMonth = 10;
		const lm = loadJson<'dates' | 'week'>(STORAGE_LAYOUT_MODE_KEY, 'dates');
		layoutMode = lm === 'week' ? 'week' : 'dates';
		const tm = loadJson<'system' | 'light' | 'dark'>(STORAGE_THEME_MODE_KEY, 'system');
		themeMode = tm === 'light' || tm === 'dark' ? tm : 'system';
	}

	function persistPrefs(): void {
		saveJson<boolean>(STORAGE_HIDE_BIRTHDAYS_KEY, hideBirthdays);
		saveJson<number>(STORAGE_EVENT_ROWS_KEY, eventRowsPerMonth);
		saveJson<'dates' | 'week'>(STORAGE_LAYOUT_MODE_KEY, layoutMode);
		saveJson<'system' | 'light' | 'dark'>(STORAGE_THEME_MODE_KEY, themeMode);
	}

	function applyTheme(): void {
		const root = document.documentElement;
		if (themeMode === 'system') {
			delete (root.dataset as { theme?: string }).theme;
		} else {
			root.dataset.theme = themeMode;
		}
	}

	function applyPrefs(events: PlannerAllDayEvent[]): PlannerAllDayEvent[] {
		const filtered = hideBirthdays ? events.filter((ev) => !isBirthdayTitle(ev.title)) : events;
		return dedupeAllDayEvents(filtered);
	}

	function isBirthdayTitle(title: string): boolean {
		return /birthday/i.test(title);
	}

	function canonicalTitleForKey(title: string): string {
		// Normalize for dedupe (ignore leading gift emoji we add for birthdays).
		return title.replace(/^🎁\s*/u, '').trim().toLowerCase();
	}

	function dedupeAllDayEvents(events: PlannerAllDayEvent[]): PlannerAllDayEvent[] {
		const byKey = new Map<string, PlannerAllDayEvent>();

		for (const ev of events) {
			const key = `${ev.startDate}|${ev.endDateExclusive}|${canonicalTitleForKey(ev.title)}`;
			const existing = byKey.get(key);
			if (!existing) {
				byKey.set(key, ev);
				continue;
			}

			// Merge sources (unique by calendarId)
			const seen = new Set(existing.sources.map((s) => s.calendarId));
			for (const s of ev.sources) {
				if (seen.has(s.calendarId)) continue;
				existing.sources.push(s);
				seen.add(s.calendarId);
			}

			// Fill missing optional fields
			if (!existing.description && ev.description) existing.description = ev.description;
			if (!existing.location && ev.location) existing.location = ev.location;
			if (!existing.htmlLink && ev.htmlLink) existing.htmlLink = ev.htmlLink;
		}

		return Array.from(byKey.values());
	}

	function toPlannerCalendars(items: Awaited<ReturnType<typeof listCalendars>>): PlannerCalendar[] {
		return items
			.map((c) => ({
				id: c.id,
				title: c.summary ?? c.id,
				backgroundColor: c.backgroundColor ?? '#4b5563',
				foregroundColor: c.foregroundColor ?? '#ffffff',
				primary: Boolean(c.primary)
			}))
			.sort((a, b) => Number(b.primary) - Number(a.primary) || a.title.localeCompare(b.title));
	}

	function normalizeAllDayEvents(
		calendarId: string,
		raw: Awaited<ReturnType<typeof listAllDayEventsForYear>>,
		cal: PlannerCalendar
	): PlannerAllDayEvent[] {
		const primaryColor = { bg: cal.backgroundColor, fg: cal.foregroundColor };
		return raw.map((ev) => ({
			id: ev.id,
			calendarId,
			title: (() => {
				const base = ev.summary ?? '(untitled)';
				if (isBirthdayTitle(base) && !base.trimStart().startsWith('🎁')) return `🎁 ${base}`;
				return base;
			})(),
			startDate: ev.start?.date ?? '',
			endDateExclusive: ev.end?.date ?? '',
			color: primaryColor,
			sources: [{ calendarId, color: primaryColor }],
			description: ev.description,
			location: ev.location,
			htmlLink: ev.htmlLink
		}));
	}

	function persistSession(token: string, expiresInSeconds: number): void {
		const expiresAtMs = Date.now() + Math.max(0, expiresInSeconds) * 1000;
		saveJson(SESSION_AUTH_KEY, { token, expiresAtMs });
	}

	function loadSession(): { token: string; expiresAtMs: number } | null {
		const sess = loadJson<{ token: string; expiresAtMs: number } | null>(SESSION_AUTH_KEY, null);
		if (!sess?.token || !sess?.expiresAtMs) return null;
		return sess;
	}

	function clearSession(): void {
		saveJson(SESSION_AUTH_KEY, null);
	}

	async function refreshCalendarsAndEvents(): Promise<void> {
		if (!accessToken) return;
		syncing = true;
		try {
			const calItems = await listCalendars(accessToken);
			calendars = toPlannerCalendars(calItems);

			// if nothing selected yet, default to primary + any "selected" calendars Google marks
			if (selectedCalendarIds.size === 0) {
				for (const c of calItems) {
					if (c.primary || c.selected) selectedCalendarIds.add(c.id);
				}
				persistSelected();
			}

			const all: PlannerAllDayEvent[] = [];

			for (const calId of selectedCalendarIds) {
				const cal = calendars.find((c) => c.id === calId);
				if (!cal) continue;

				const raw = await listAllDayEventsForYear({ accessToken, calendarId: calId, year });
				const normalized = normalizeAllDayEvents(calId, raw, cal);
				for (const ev of normalized) {
					all.push(ev);
				}
			}

			allDayEventsRaw = all;
			allDayEvents = applyPrefs(allDayEventsRaw);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			setError(msg);
		} finally {
			syncing = false;
		}
	}

	function signIn(): void {
		if (!VITE_GOOGLE_CLIENT_ID) {
			return setError('Missing VITE_GOOGLE_CLIENT_ID. Add it to .env and restart dev server.');
		}
		if (!isGoogleGisLoaded()) {
			return setError('Google Identity Services script has not loaded yet.');
		}

		const client = createTokenClient({
			client_id: VITE_GOOGLE_CLIENT_ID,
			scope: VITE_GOOGLE_SCOPES,
			callback: (resp) => {
				if (resp.error) return setError(resp.error_description ?? resp.error);
				accessToken = resp.access_token;
				persistSession(resp.access_token, resp.expires_in);
				status = 'signed_in';
				void refreshCalendarsAndEvents();
			}
		});

		client.requestAccessToken({ prompt: 'select_account' });
	}

	async function signOut(): Promise<void> {
		if (accessToken) await revokeToken(accessToken);
		accessToken = null;
		allDayEvents = [];
		calendars = [];
		clearSession();
		status = 'signed_out';
	}

	onMount(() => {
		loadSelected();
		loadPrefs();
		applyTheme();

		const sess = loadSession();
		// If we have a token valid for at least 60s, reuse it and auto-load.
		if (sess && sess.expiresAtMs - Date.now() > 60_000) {
			accessToken = sess.token;
			status = 'signed_in';
			void refreshCalendarsAndEvents();
		}

		// We can’t reliably know exactly when GIS is loaded, so we poll briefly.
		const startedAt = Date.now();
		const timer = window.setInterval(() => {
			if (isGoogleGisLoaded()) {
				window.clearInterval(timer);
				status = 'signed_out';
				return;
			}
			if (Date.now() - startedAt > 5000) {
				window.clearInterval(timer);
				status = 'signed_out';
			}
		}, 50);

		return () => window.clearInterval(timer);
	});
</script>

<main>
	<header>
		<div class="title">
			<h1>Year Planner</h1>
			<p class="sub">All‑day events from Google Calendar, shown for the entire year.</p>
			<p class="meta">
				<a href="{base}/privacy">Privacy Policy</a> &bull; <a href="{base}/terms">Terms</a>
			</p>
		</div>

		<div class="controls">
			<label class="year">
				<span>Year</span>
				<input
					type="number"
					min="1970"
					max="2100"
					bind:value={year}
					onchange={() => status === 'signed_in' && void refreshCalendarsAndEvents()}
				/>
			</label>

			{#if status === 'signed_in'}
				<button class="secondary" onclick={() => void refreshCalendarsAndEvents()} disabled={syncing}>
					{syncing ? 'Syncing…' : 'Refresh'}
				</button>
				<button class="secondary" onclick={() => (settingsOpen = true)} aria-label="Settings">⚙️</button>
				<button class="secondary" onclick={() => void signOut()}>Sign out</button>
			{:else}
				<button class="secondary" onclick={() => (settingsOpen = true)} aria-label="Settings">⚙️</button>
				<button onclick={signIn}>Sign in with Google</button>
			{/if}
		</div>
	</header>

	{#if status === 'error'}
		<div class="error">
			<strong>Error:</strong> {errorMessage}
		</div>
	{/if}

	<section class="grid">
		<YearGrid
			{year}
			{allDayEvents}
			fixedEventRows={eventRowsPerMonth}
			layoutMode={layoutMode}
			onSelectEvent={(ev) => {
				selectedEvent = ev;
			}}
		/>
	</section>

	<EventModal
		event={selectedEvent}
		calendars={calendars}
		onClose={() => {
			selectedEvent = null;
		}}
	/>

	<SettingsModal
		open={settingsOpen}
		{hideBirthdays}
		{eventRowsPerMonth}
		{layoutMode}
		{themeMode}
		{calendars}
		{selectedCalendarIds}
		onChange={(next) => {
			hideBirthdays = next.hideBirthdays;
			eventRowsPerMonth = next.eventRowsPerMonth;
			layoutMode = next.layoutMode;
			themeMode = next.themeMode;
			persistPrefs();
			applyTheme();
			// No refetch needed: apply settings to the last fetched events.
			allDayEvents = applyPrefs(allDayEventsRaw);
		}}
		onToggleCalendar={(id) => {
			toggleCalendar(id);
			void refreshCalendarsAndEvents();
		}}
		onClose={() => (settingsOpen = false)}
	/>
</main>

<style>
	main {
		padding: 12px 14px;
		width: 100vw;
		height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}
	.title h1 {
		margin: 0;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 20px;
	}
	.sub {
		margin: 2px 0 0;
		color: var(--muted);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
	}
	.meta {
		margin: 2px 0 0;
		color: var(--muted);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 11px;
	}
	.meta a {
		color: inherit;
		text-decoration: none;
	}
	.meta a:hover {
		text-decoration: underline;
	}
	.controls {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}
	.year {
		display: inline-flex;
		gap: 6px;
		align-items: center;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
		color: var(--text);
	}
	.year input {
		width: 92px;
		padding: 6px 8px;
		border: 1px solid var(--border);
		background: var(--panel);
		color: var(--text);
		border-radius: 6px;
	}
	button {
		padding: 7px 10px;
		border-radius: 8px;
		border: 1px solid var(--btn-border);
		background: var(--btn-bg);
		color: var(--btn-text);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
		cursor: pointer;
	}
	button.secondary {
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		border: 1px solid var(--btn-secondary-border);
	}
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.error {
		margin: 10px 0;
		padding: 10px 12px;
		border: 1px solid #fca5a5;
		background: #fef2f2;
		color: #7f1d1d;
		border-radius: 10px;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 13px;
	}
	.grid {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}
</style>
