import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'

const config = {
    languageOptions: {
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        globals: { console: 'readonly', process: 'readonly' }
    },
    rules: {
        'func-style': ['error', 'expression'],
        'no-unexpected-multiline': 'error',
        'no-unused-vars': 'off',
        // override rule from typescript-eslint.
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }
        ]
    }
}

const ignore = {
    ignores: [
        'node_modules/**',
        'build/**',
        'dist/**',
        'NetscriptDefinitions.d.ts'
    ]
}

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    eslintConfigPrettier,
    config,
    ignore
)
