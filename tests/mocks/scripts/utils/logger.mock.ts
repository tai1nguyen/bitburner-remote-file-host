import { vi } from 'vitest'

const success = vi.fn()
const info = vi.fn()
const warn = vi.fn()
const error = vi.fn()
const toTerminal = vi.fn()

export const Logger = {
    Logger: vi.fn(
        class {
            constructor() {}

            success = success
            info = info
            warn = warn
            error = error
            toTerminal = toTerminal
        }
    ),
    success,
    info,
    warn,
    error,
    toTerminal
}
