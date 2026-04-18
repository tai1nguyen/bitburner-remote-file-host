import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        ...configDefaults,
        globals: false,
        include: [...configDefaults.include, './tests/unit/**/*.{test,spec}.ts']
    },
    resolve: { tsconfigPaths: true }
})
