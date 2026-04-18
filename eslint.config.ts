import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, Config } from 'eslint/config'

const config: Config = {
    languageOptions: {
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        globals: { console: 'readonly', process: 'readonly' }
    },
    rules: {
        'func-style': ['error', 'expression'],
        'no-unexpected-multiline': 'error',
        'require-await': 'warn',
        // 'no-explicit-any': 'error',
        // Allow unused variables if they are prefixed with `_`.
        // Must turn off the rule in eslint and override
        // the one from typescript-eslint.
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }
        ],
        '@typescript-eslint/no-explicit-any': 'warn'
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
