<script lang="ts">
	import { addDaysIso, daysInMonth, formatIsoDate, isoToDayOfWeek, parseIsoDate } from '$lib/date/iso';
	import {
		barBackground,
		clampEventToMonth,
		clampEventToWeek,
		endInclusive,
		intersectsMonth,
		intersectsWeek,
		isWeekend,
		lanePack,
		type MonthBar
	} from '$lib/logic/grid';
	import type { PlannerAllDayEvent } from '$lib/types/planner';
	import YearGridHeader from './year-grid/YearGridHeader.svelte';
	import YearGridTooltip from './year-grid/YearGridTooltip.svelte';

	type MonthDayCell = { idx: number; day: number; dow: number; iso: string; valid: boolean };
	type WeekRow = { weekNum: number; startDate: string; cells: { iso: string; day: number; month: number }[] };

	type Props = {
		year: number;
		allDayEvents: PlannerAllDayEvent[];
		onSelectEvent?: (event: PlannerAllDayEvent) => void;
		fixedEventRows?: number;
		layoutMode?: 'dates' | 'week' | 'vertical';
		weekStart?: 0 | 1 | 6;
	};

	let { year, allDayEvents, onSelectEvent, fixedEventRows, layoutMode, weekStart }: Props = $props();
	const mode = () => (layoutMode === 'week' ? 'week' : layoutMode === 'vertical' ? 'vertical' : 'dates');
	const colCount = () => (mode() === 'week' ? 42 : mode() === 'vertical' ? 7 : 31);
	const cellMin = () => (mode() === 'week' ? 20 : mode() === 'vertical' ? 32 : 22);

	const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	type HoverInfo = {
		title: string;
		dateRange: string;
		x: number;
		y: number;
	};

	let hover = $state<HoverInfo | null>(null);
	// 0=Sun, 1=Mon, ..., 6=Sat
	let weekStartDay = $derived(weekStart ?? 0); 

	function buildMonthCells(month1to12: number): MonthDayCell[] {
		const dim = daysInMonth(year, month1to12);
		if (mode() === 'week') {
			const firstIso = formatIsoDate(year, month1to12, 1);
			const firstDow = isoToDayOfWeek(firstIso); // 0=Sun
			return Array.from({ length: 42 }, (_, pos) => {
				const dayNum = pos - firstDow + 1;
				const valid = dayNum >= 1 && dayNum <= dim;
				const iso = valid ? formatIsoDate(year, month1to12, dayNum) : '';
				const dow = pos % 7;
				return { idx: pos, day: valid ? dayNum : 0, dow, iso, valid };
			});
		}

		return Array.from({ length: 31 }, (_, i) => {
			const day = i + 1;
			const valid = day <= dim;
			const iso = valid ? formatIsoDate(year, month1to12, day) : '';
			const dow = valid ? isoToDayOfWeek(iso) : 0;
			return { idx: i, day, dow, iso, valid };
		});
	}

	function buildYearWeeks(): WeekRow[] {
		const weeks: WeekRow[] = [];
		// Start from Jan 1
		let currentIso = formatIsoDate(year, 1, 1);
		// Align to start of week (using weekStartDay)
		// dow is 0=Sun. if weekStartDay=1 (Mon), and dow=0 (Sun), diff = (0 - 1 + 7)%7 = 6. -> subtract 6 days.
		const dow = isoToDayOfWeek(currentIso);
		const daysToSubtract = (dow - weekStartDay + 7) % 7;
		let weekStart = addDaysIso(currentIso, -daysToSubtract);

		// Generate 53 weeks to cover the whole year
		for (let i = 0; i < 53; i++) {
			const cells = [];
			for (let d = 0; d < 7; d++) {
				const iso = addDaysIso(weekStart, d);
				const { year: y, month, day } = parseIsoDate(iso);
				// If we've moved to the next year completely, stop (unless it's the first week of next year overlapping)
				// Actually, we just want to cover all days in current `year`.
				cells.push({ iso, day, month });
			}
			weeks.push({ weekNum: i + 1, startDate: weekStart, cells });
			weekStart = addDaysIso(weekStart, 7);
			
			// Stop if the start of next week is strictly in the next year
			const nextWeekStart = parseIsoDate(weekStart);
			if (nextWeekStart.year > year) break;
		}
		return weeks;
	}

	function buildMonthBars(month1to12: number): { bars: MonthBar[]; laneCount: number; hiddenCount: number } {
		const firstDow =
			mode() === 'week' ? isoToDayOfWeek(formatIsoDate(year, month1to12, 1)) : 0;

		const candidates = allDayEvents
			.filter((ev) => intersectsMonth(ev, year, month1to12))
			.map((ev) => {
				const clamped = clampEventToMonth(ev, year, month1to12);
				if (!clamped) return null;

				const colStart =
					mode() === 'week'
						? 2 + (firstDow + (clamped.startDay - 1))
						: 1 + clamped.startDay; // dates
				const colEnd =
					mode() === 'week'
						? 2 + (firstDow + (clamped.endDayExclusive - 1))
						: 1 + clamped.endDayExclusive;

				// month row grid: col 1 is label, first day cell starts at col 2
				return {
					id: `${ev.calendarId}:${ev.id}:${ev.startDate}:${ev.endDateExclusive}`,
					title: ev.title,
					bg: ev.color.bg,
					fg: ev.color.fg,
					colStart,
					colEnd,
					event: ev
				};
			})
			.filter((x): x is Omit<MonthBar, 'lane'> => Boolean(x))
			.sort((a, b) => a.colStart - b.colStart || a.colEnd - b.colEnd || a.title.localeCompare(b.title));

		const bars = lanePack(candidates);
		const laneCount = bars.reduce((m, b) => Math.max(m, b.lane + 1), 0);

		const maxLanes = fixedEventRows && fixedEventRows > 0 ? fixedEventRows : Math.max(1, laneCount);
		const visible = bars.filter((b) => b.lane < maxLanes);
		const hiddenCount = bars.length - visible.length;

		return { bars: visible, laneCount: maxLanes, hiddenCount };
	}

	function buildWeekBars(week: WeekRow): { bars: MonthBar[]; laneCount: number; hiddenCount: number } {
		const candidates = allDayEvents
			.filter((ev) => intersectsWeek(ev, week.startDate))
			.map((ev) => {
				const clamped = clampEventToWeek(ev, week.startDate);
				if (!clamped) return null;

				// vertical grid: col 1 is week label/gutter, days are 2-8
				return {
					id: `${ev.calendarId}:${ev.id}:${ev.startDate}:${ev.endDateExclusive}:w${week.weekNum}`,
					title: ev.title,
					bg: ev.color.bg,
					fg: ev.color.fg,
					colStart: 2 + clamped.startIdx,
					colEnd: 2 + clamped.endIdxExclusive,
					event: ev
				};
			})
			.filter((x): x is Omit<MonthBar, 'lane'> => Boolean(x))
			.sort((a, b) => a.colStart - b.colStart || a.colEnd - b.colEnd || a.title.localeCompare(b.title));

		const bars = lanePack(candidates);
		const laneCount = bars.reduce((m, b) => Math.max(m, b.lane + 1), 0);
		
		const maxLanes = fixedEventRows && fixedEventRows > 0 ? fixedEventRows : Math.max(1, laneCount);
		const visible = bars.filter((b) => b.lane < maxLanes);
		const hiddenCount = bars.length - visible.length;
		
		return { bars: visible, laneCount: maxLanes, hiddenCount };
	}

	function onBarEnter(e: MouseEvent, ev: PlannerAllDayEvent): void {
		onBarMove(e, ev);
	}

	function onBarMove(e: MouseEvent, ev: PlannerAllDayEvent): void {
		const maxW = 360;
		const maxH = 140;
		const pad = 14;

		const vw = window.innerWidth;
		const vh = window.innerHeight;

		const x = Math.min(e.clientX + 12, vw - maxW - pad);
		const y = Math.min(e.clientY + 12, vh - maxH - pad);

		hover = {
			title: ev.title,
			dateRange: `${ev.startDate} → ${endInclusive(ev)}`,
			x: Math.max(pad, x),
			y: Math.max(pad, y)
		};
	}

	function onBarLeave(): void {
		hover = null;
	}
</script>

<div class="wrap" class:vertical={mode() === 'vertical'} style={`--col-count:${colCount()}; --cell-min:${cellMin()}px;`}>
	<div class="year">{year}</div>

	<YearGridHeader mode={mode()} weekStartDay={weekStartDay} />

	{#if mode() === 'vertical'}
		{#each buildYearWeeks() as week}
			{@const wb = buildWeekBars(week)}
			<!-- Determine if this week starts a new month to show a label? Or just show week range? -->
			<!-- For simplicity, let's just show Week Number, maybe month name if it's the first week of month -->
			<div class="monthRow weekRow" style={`--lane-count:${Math.max(1, wb.laneCount)};`}>
				<div class="monthLabel weekLabel">
					<span>W{week.weekNum}</span>
					{#if wb.hiddenCount > 0}
						<span class="more" title={`${wb.hiddenCount} event(s) not shown`}>+{wb.hiddenCount}</span>
					{/if}
				</div>
				<div class="monthGutter"></div>

				{#each week.cells as c, idx}
					{@const isCurMonth = c.iso.startsWith(year + '-')}
					{@const cellDow = (idx + weekStartDay) % 7}
					<div class="dayCell" class:weekend={isWeekend(cellDow)} title={c.iso} style={`opacity: ${isCurMonth ? 1 : 0.4}`}>
						<span class="d">{c.day}</span>
						{#if c.day === 1 || (idx === 0 && week.cells[6].month !== c.month)}
							<span class="mLabel">{monthLabels[c.month - 1]}</span>
						{/if}
					</div>
				{/each}

				{#each wb.bars as b (b.id)}
					<button
						class="bar"
						class:singleDay={b.colEnd - b.colStart === 1}
						style={`grid-column:${b.colStart} / ${b.colEnd}; grid-row:${b.lane + 2}; background:${barBackground(b.event)}; color:${b.fg};`}
						type="button"
						onclick={() => onSelectEvent?.(b.event)}
						onmouseenter={(e) => onBarEnter(e, b.event)}
						onmousemove={(e) => onBarMove(e, b.event)}
						onmouseleave={onBarLeave}
					>
						<span class="barText">{b.title}</span>
					</button>
				{/each}
			</div>
		{/each}
	{:else}
		{#each Array.from({ length: 12 }, (_, i) => i + 1) as month}
			{@const cells = buildMonthCells(month)}
			{@const mb = buildMonthBars(month)}
			<div class="monthRow" style={`--lane-count:${Math.max(1, mb.laneCount)};`}>
				<div class="monthLabel">
					<span>{monthLabels[month - 1]}</span>
					{#if mb.hiddenCount > 0}
						<span class="more" title={`${mb.hiddenCount} event(s) not shown`}>+{mb.hiddenCount}</span>
					{/if}
				</div>
				<div class="monthGutter"></div>

				{#each cells as c (month + ':' + c.idx)}
					{#if c.valid}
						<div class="dayCell" class:weekend={isWeekend(c.dow)} title={c.iso}>
							{#if mode() === 'week'}
								<span class="d">{c.day}</span>
							{:else}
								<span class="w">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][c.dow]}</span>
							{/if}
						</div>
					{:else}
						<div class="dayCell empty"></div>
					{/if}
				{/each}

				{#each mb.bars as b (b.id)}
					<button
						class="bar"
						class:singleDay={b.colEnd - b.colStart === 1}
						style={`grid-column:${b.colStart} / ${b.colEnd}; grid-row:${b.lane + 2}; background:${barBackground(b.event)}; color:${b.fg};`}
						type="button"
						onclick={() => onSelectEvent?.(b.event)}
						onmouseenter={(e) => onBarEnter(e, b.event)}
						onmousemove={(e) => onBarMove(e, b.event)}
						onmouseleave={onBarLeave}
					>
						<span class="barText">{b.title}</span>
					</button>
				{/each}
			</div>
		{/each}
	{/if}

	{#if hover}
		<YearGridTooltip {...hover} />
	{/if}
</div>

<style>
	.wrap {
		width: 100%;
		min-width: 980px;
		--col-count: 31;
		--cell-min: 22px;
	}
	/* Vertical mode is mobile friendly */
	.wrap.vertical {
		min-width: 320px;
	}

	.year {
		text-align: center;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 18px;
		margin: 8px 0 10px;
	}

	.monthRow {
		--lane-count: 1;
		display: grid;
		grid-template-columns: 72px repeat(var(--col-count), minmax(var(--cell-min), 1fr));
		grid-template-rows: 20px repeat(var(--lane-count), 22px);
		align-items: center;
		margin-bottom: 4px;
	}

	.monthLabel {
		grid-column: 1;
		grid-row: 1;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		text-transform: uppercase;
		font-size: 12px;
		color: var(--text);
		padding-left: 6px;
		padding-right: 6px;
		border-bottom: 1px solid var(--border);
	}
	.more {
		font-size: 11px;
		color: var(--text);
		background: rgba(127, 127, 127, 0.18);
		padding: 1px 6px;
		border-radius: 999px;
	}

	.monthGutter {
		grid-column: 1;
		grid-row: 2 / -1;
	}

	.dayCell {
		grid-row: 1;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid var(--border);
		color: var(--text);
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: 10px;
		position: relative;
	}
	.dayCell.weekend {
		background: var(--weekend);
	}
	.dayCell.empty {
		background: transparent;
	}
	.mLabel {
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 10px;
		background: var(--focus);
		color: var(--bg);
		padding: 2px 6px;
		border-radius: 99px;
		font-weight: 700;
		line-height: 1;
		z-index: 5;
		box-shadow: 0 0 0 3px var(--bg);
	}
	.w {
		color: var(--muted);
	}
	.d {
		color: var(--text);
	}

	.bar {
		height: 18px;
		margin: 2px 2px;
		padding: 0 6px;
		border-radius: 999px;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		font-size: clamp(10px, 0.85vw, 12px);
		line-height: 18px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: clip;
		box-shadow: inset 0 0 0 1px rgba(127, 127, 127, 0.28);
		border: 0;
		cursor: pointer;
		text-align: left;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.barText {
		min-width: 0;
		overflow: hidden;
		text-overflow: clip;
	}

	/* Single-day pills: allow 2 lines (fits within the fixed lane height by removing vertical margins). */
	.bar.singleDay {
		height: 22px;
		font-size: 9px;
		line-height: 9px;
		align-items: flex-start;
		justify-content: center;
		text-align: center;
		margin-top: 0;
		margin-bottom: 0;
		padding: 2px 1px 0;
		white-space: normal;
		border-radius: 12px;
	}
	.wrap.vertical .bar.singleDay {
		font-size: clamp(9px, 2.5vw, 11px);
		line-height: 1.1;
		padding-top: 1px;
		align-items: center;
	}
	.bar.singleDay .barText {
		display: block;
		overflow: hidden;
		white-space: normal;
		text-align: center;
	}
	.bar:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
