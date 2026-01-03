<script lang="ts">
	import favicon from '$lib/assets/logo.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>Year Planner</title>
	<link rel="icon" href={favicon} />
	<meta name="description" content="All-day events from Google Calendar, shown for the entire year. Client-side only—no backend, your data stays in your browser." />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://felixsargent.com/yearly-calendar/" />
	<meta property="og:title" content="Year Planner" />
	<meta property="og:description" content="All-day events from Google Calendar, shown for the entire year. Client-side only—no backend, your data stays in your browser." />
	<meta property="og:image" content="https://felixsargent.com/yearly-calendar/og-image.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://felixsargent.com/yearly-calendar/" />
	<meta property="twitter:title" content="Year Planner" />
	<meta property="twitter:description" content="All-day events from Google Calendar, shown for the entire year. Client-side only—no backend, your data stays in your browser." />
	<meta property="twitter:image" content="https://felixsargent.com/yearly-calendar/og-image.png" />
</svelte:head>

{@render children()}

<style>
	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
	}
	:global(body) {
		overflow: hidden;
	}

	/* Theme variables (System/Light/Dark) */
	:global(html) {
		color-scheme: light;
		--bg: #ffffff;
		--panel: #ffffff;
		--text: #111111;
		--muted: #555555;
		--border: #bbbbbb;
		--border-strong: #888888;
		--weekend: #f2f2f2;
		--overlay: rgba(0, 0, 0, 0.35);
		--shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		--focus: #2563eb;

		--btn-bg: #111111;
		--btn-text: #ffffff;
		--btn-border: #111111;
		--btn-secondary-bg: #ffffff;
		--btn-secondary-text: #111111;
		--btn-secondary-border: #111111;
	}

	@media (prefers-color-scheme: dark) {
		:global(html:not([data-theme])) {
			color-scheme: dark;
			--bg: #0b0f17;
			--panel: #0f1623;
			--text: #e7eaf0;
			--muted: #a4acb9;
			--border: #2a3342;
			--border-strong: #3a465a;
			--weekend: #121a29;
			--overlay: rgba(0, 0, 0, 0.55);
			--shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
			--focus: #60a5fa;

			--btn-bg: #e7eaf0;
			--btn-text: #0b0f17;
			--btn-border: #e7eaf0;
			--btn-secondary-bg: #0f1623;
			--btn-secondary-text: #e7eaf0;
			--btn-secondary-border: #2a3342;
		}
	}

	:global(html[data-theme='dark']) {
		color-scheme: dark;
		--bg: #0b0f17;
		--panel: #0f1623;
		--text: #e7eaf0;
		--muted: #a4acb9;
		--border: #2a3342;
		--border-strong: #3a465a;
		--weekend: #121a29;
		--overlay: rgba(0, 0, 0, 0.55);
		--shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
		--focus: #60a5fa;

		--btn-bg: #e7eaf0;
		--btn-text: #0b0f17;
		--btn-border: #e7eaf0;
		--btn-secondary-bg: #0f1623;
		--btn-secondary-text: #e7eaf0;
		--btn-secondary-border: #2a3342;
	}

	:global(html[data-theme='light']) {
		color-scheme: light;
	}

	:global(body) {
		background: var(--bg);
		color: var(--text);
	}
</style>
