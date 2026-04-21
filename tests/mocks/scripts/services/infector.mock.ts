import { vi } from 'vitest'

const infect = vi.fn()

export const Infector = {
    Infector: vi.fn(
        class {
            constructor() {}

            infect = infect
        }
    ),
    infect
}
