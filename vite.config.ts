import { sveltekit } from '@sveltejs/kit/vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
export default defineConfig({
	define: {
		global: 'globalThis'
	},
	plugins: [
		sveltekit(),
		kitRoutes(),
		nodePolyfills({
			include: ['buffer', 'crypto', 'stream', 'util'],
			exclude: ['http', 'zlib', 'assert']
		})
	],
	build: {
		rollupOptions: {
			external: ['@reown/appkit-siwe']
		}
	}
});
