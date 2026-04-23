import { vi } from 'vitest'

const getBestTarget = vi.fn()
const getServers = vi.fn()
const start = vi.fn()
const logToTerminal = vi.fn()

// Builder methods
const setTargetPredicate = vi.fn()
const setOnTargetFound = vi.fn()
const setNetscript = vi.fn()
const setCount = vi.fn()

const MockWebCrawler = class {
    private constructor() {}

    getBestTarget = getBestTarget
    getServers = getServers
    start = start
    logToTerminal = logToTerminal

    public static get Builder() {
        return new this.WebCrawlerBuilder()
    }

    private static WebCrawlerBuilder = class {
        setTargetPredicate = setTargetPredicate.mockReturnValue(this)
        setOnTargetFound = setOnTargetFound.mockReturnValue(this)
        setNetscript = setNetscript.mockReturnValue(this)
        setCount = setCount.mockReturnValue(this)
        build = () => new MockWebCrawler()
    }
}

export const WebCrawler = {
    WebCrawler: MockWebCrawler,
    getBestTarget,
    getServers,
    start,
    logToTerminal,
    Builder: { setTargetPredicate, setOnTargetFound, setNetscript, setCount }
}
