import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		react({
			jsxRuntime: "automatic",
		}),
		dts({
			exclude: [
				"**/*.stories.{js,jsx,ts,tsx}",
				"**/*.test.{js,jsx,ts,tsx}",
			],
		}),
		tailwindcss(),
	],
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "ReactSpreadsheetUpload",
			fileName: (format) => `rsu.${format}.js`,
			formats: ["es", "cjs", "umd"],
		},
		rollupOptions: {
			external: (id) => {
				return /^(react|react-dom|react\/jsx-runtime|react\/jsx-dev-runtime)$/.test(
					id,
				);
			},
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "React",
				},
				preserveModules: false,
				manualChunks: undefined,
			},
		},
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ["console.log", "console.info", "console.debug"],
			},
			mangle: {
				safari10: true,
			},
		},
		chunkSizeWarningLimit: 1000,
	},
	define: {
		"process.env.NODE_ENV": JSON.stringify("production"),
	},
	optimizeDeps: {
		include: ["clsx", "papaparse", "xlsx"],
	},
});
