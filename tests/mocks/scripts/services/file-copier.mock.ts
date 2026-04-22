import { vi } from 'vitest'

const copyScriptFiles = vi.fn()
const logToTerminal = vi.fn()

export const FileCopier = {
    FileCopier: vi.fn(
        class {
            constructor() {}

            copyScriptFiles = copyScriptFiles
            logToTerminal = logToTerminal
        }
    ),
    copyScriptFiles,
    logToTerminal
}
