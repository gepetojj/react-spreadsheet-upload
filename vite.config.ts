import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import { peerDependencies } from "./package.json";

export default defineConfig({
	plugins: [
		react(),
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
			external: Object.keys(peerDependencies),
			output: { globals: { react: "React", "react-dom": "ReactDOM" } },
		},
	},
});
