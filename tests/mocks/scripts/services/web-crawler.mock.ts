import { vi } from 'vitest'

const getBestTarget = vi.fn()
const getServers = vi.fn()
const hunt = vi.fn()

export const WebCrawler = {
    WebCrawler: vi.fn(
        class {
            constructor() {}

            getBestTarget = getBestTarget
            getServers = getServers
            hunt = hunt
        }
    ),
    getBestTarget,
    getServers,
    hunt
}
