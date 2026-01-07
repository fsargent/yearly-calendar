<script lang="ts">
</script>

<main>
	<h1>About Year Planner</h1>

	<section>
		<h2>What is Year Planner?</h2>
		<p>
			Year Planner is a client-side web application that displays your Google Calendar all-day events in a single yearly grid view. It shows holidays, vacations, birthdays, and other full-day reminders at a glance, helping you see your schedule and plan ahead.
		</p>
	</section>

	<section>
		<h2>Why does Year Planner need Google Calendar access?</h2>
		<p>
			To display your calendar events, Year Planner requests read-only access to your Google Calendar through Google OAuth. The application accesses:
		</p>
		<ul>
			<li><strong>Your calendar list:</strong> To let you choose which calendars to display</li>
			<li><strong>All-day events:</strong> To show events for the selected year in the grid view</li>
		</ul>
		<p>
			Year Planner only requests the minimum permissions needed to provide this functionality. It does not modify, delete, or create any calendar events.
		</p>
	</section>

	<section>
		<h2>How does Year Planner use your data?</h2>
		<p>
			Your calendar data is used only to render the yearly grid display. All data is stored locally in your browser—nothing is sent to our servers or any third parties (except Google, as part of the API request to fetch your calendar data).
		</p>
		<p>
			Your preferences—such as which calendars are selected, theme settings, and layout options—are also saved locally in your browser for convenience.
		</p>
	</section>

	<section>
		<h2>Privacy and Security</h2>
		<p>
			Year Planner is a "local-first" application. Your calendar data never leaves your device except when fetching it from Google's servers. You can revoke access at any time through your <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a> page.
		</p>
		<p>
			For more details, see our <a href="../privacy">Privacy Policy</a>.
		</p>
	</section>

	<section>
		<h2>Open Source</h2>
		<p>
			Year Planner is open source software. The source code is available on <a href="https://github.com/fsargent/yearly-calendar" target="_blank">GitHub</a>.
		</p>
	</section>

	<footer class="controls">
		<a href="../">Back to App</a> &bull; <a href="../privacy">Privacy Policy</a> &bull; <a href="../terms">Terms</a>
	</footer>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 40px 20px;
		font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
		color: var(--text);
		line-height: 1.6;
		height: 100vh;
		overflow-y: auto;
		box-sizing: border-box;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	h2 {
		margin-top: 2rem;
		font-size: 1.5rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.5rem;
	}

	h3 {
		font-size: 1.2rem;
		margin-top: 1.5rem;
	}

	p, li {
		color: var(--text);
		font-size: 1rem;
	}

	a {
		color: var(--focus);
	}

	.controls {
		margin-top: 40px;
		padding-top: 20px;
		border-top: 1px solid var(--border);
	}
</style>
