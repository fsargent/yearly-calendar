import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // GitHub Pages serves under "/<repo-name>" for project pages, so we set the base path at build time.
    // For local dev, BASE_PATH should be unset/empty.
    paths: {
      base: process.env.BASE_PATH ?? "",
    },

    adapter: adapter({
      // Allows client-side navigation for unknown routes on static hosts (serves 404.html).
      fallback: "404.html",
    }),
    prerender: {
      entries: ["*"],
    },
  },
};

export default config;
