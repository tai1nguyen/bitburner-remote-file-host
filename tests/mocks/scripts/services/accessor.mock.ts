import { vi } from 'vitest'

const getRootAccess = vi.fn()
const logToTerminal = vi.fn()

export const Accessor = {
    Accessor: vi.fn(
        class {
            constructor() {}

            getRootAccess = getRootAccess
            logToTerminal = logToTerminal
        }
    ),
    getRootAccess,
    logToTerminal
}
