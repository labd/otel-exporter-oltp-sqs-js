import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		slowTestThreshold: 100,
		coverage: {
			provider: "v8",
			reporter: [
				"text",
				["json-summary", { file: "coverage-summary.json" }],
				["json", { file: "coverage.json" }],
			],
			reportsDirectory: "./coverage",
			all: true,
			include: [
				"src/**/*.ts",
			],
		},

	},
});
