import { vi } from 'vitest'

const run = vi.fn()

export const Executor = {
    Executor: vi.fn(
        class {
            constructor() {}

            run = run
        }
    ),
    run
}
