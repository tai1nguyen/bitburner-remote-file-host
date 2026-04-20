import { vi } from 'vitest'

export const Infector = {
    Infector: vi.fn(
        class {
            constructor() {}

            infect = vi.fn()
        }
    )
}
