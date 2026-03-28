import { defineConfig } from 'tsup'

export default defineConfig([
	{
		entry: { index: 'src/index.ts' },
		format: ['cjs', 'esm'],
		dts: true,
		sourcemap: true,
		clean: true,
		external: ['react'],
	},
	{
		entry: { react: 'src/react.ts' },
		format: ['cjs', 'esm'],
		dts: true,
		sourcemap: true,
		external: ['react'],
		banner: {
			js: "'use client';",
		},
	},
])
