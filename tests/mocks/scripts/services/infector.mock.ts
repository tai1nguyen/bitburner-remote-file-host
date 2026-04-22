import { vi } from 'vitest'

const infect = vi.fn()
const logToTerminal = vi.fn()

export const Infector = {
    Infector: vi.fn(
        class {
            constructor() {}

            infect = infect
            logToTerminal = logToTerminal
        }
    ),
    infect,
    logToTerminal
}
