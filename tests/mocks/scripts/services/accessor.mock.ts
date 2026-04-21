import { vi } from 'vitest'

const getRootAccess = vi.fn()

export const Accessor = {
    Accessor: vi.fn(
        class {
            constructor() {}

            getRootAccess = getRootAccess
        }
    ),
    getRootAccess
}
