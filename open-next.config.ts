// default open-next.config.ts file created by @opennextjs/cloudflare
import {
	defineCloudflareConfig,
	type OpenNextConfig,
} from "@opennextjs/cloudflare/config";

const cloudflareConfig = defineCloudflareConfig({
	incrementalCache: "dummy",
});

export default {
	...cloudflareConfig,
	// Next 16's Turbopack build can stall when OpenNext enables standalone
	// output tracing. Webpack is the stable Cloudflare packaging path here.
	buildCommand: "pnpm exec next build --webpack",
} satisfies OpenNextConfig;
