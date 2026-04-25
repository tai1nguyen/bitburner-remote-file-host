import { vi } from 'vitest'

const run = vi.fn()
const growTarget = vi.fn()
const harvestTarget = vi.fn()

export const Executor = {
    Executor: vi.fn(
        class {
            constructor() {}
            growTarget = growTarget
            harvestTarget = harvestTarget
            run = run
        }
    ),
    growTarget,
    harvestTarget,
    run
}
