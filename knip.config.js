export default {
	entry: ['src/main.tsx'],
	project: ['src/**/*.{js,jsx,ts,tsx}'],

	ignoreDependencies: [
		'autoprefixer',
		'babel-plugin-transform-typescript-const-enums',
		'vite-plugin-pwa',
		'wrangler',
	],
};
