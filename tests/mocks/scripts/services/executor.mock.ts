import { vi } from 'vitest'

const run = vi.fn()
const growTarget = vi.fn()
const harvestTarget = vi.fn()
const growHarvestTarget = vi.fn()

export const Executor = {
    Executor: vi.fn(
        class {
            constructor() {}
            growTarget = growTarget
            harvestTarget = harvestTarget
            growHarvestTarget = growHarvestTarget
            run = run
        }
    ),
    growTarget,
    harvestTarget,
    growHarvestTarget,
    run
}
