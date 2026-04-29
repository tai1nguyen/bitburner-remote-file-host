import { vi } from 'vitest'

const processUpdates = vi.fn()

export const NodeManager = {
    NodeManager: vi.fn(
        class {
            constructor() {}
            processUpdates = processUpdates
        }
    ),
    processUpdates
}
