import { vi } from 'vitest'

const run = vi.fn()
const growTarget = vi.fn()
const harvestTarget = vi.fn()

export const Executor = {
    Executor: vi.fn(
        class {
            constructor() {}
            harvestTarget = harvestTarget
            growTarget = growTarget
            run = run
        }
    ),
    harvestTarget,
    growTarget,
    run
}
