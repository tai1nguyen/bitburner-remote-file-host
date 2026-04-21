import { vi } from 'vitest'

const copyScriptFiles = vi.fn()

export const FileCopier = {
    FileCopier: vi.fn(
        class {
            constructor() {}

            copyScriptFiles = copyScriptFiles
        }
    ),
    copyScriptFiles
}
