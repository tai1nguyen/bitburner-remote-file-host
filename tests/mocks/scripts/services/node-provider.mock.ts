import { vi } from 'vitest'

const getNodes = vi.fn()
const upgradeNodes = vi.fn()

export const NodeProvider = {
    NodeProvider: vi.fn(
        class {
            constructor() {}
            getNodes = getNodes
            upgradeNodes = upgradeNodes
        }
    ),
    getNodes,
    upgradeNodes
}
