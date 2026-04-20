import { vi } from 'vitest'

export const Executor = {
    Executor: vi.fn(
        class {
            constructor() {}

            run = vi.fn()
        }
    )
}
