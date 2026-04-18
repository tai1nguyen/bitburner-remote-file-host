import { vi } from 'vitest'

export const MockExecutor = {
    Executor: vi.fn(
        class {
            constructor() {}

            run = vi.fn()
        }
    )
}
