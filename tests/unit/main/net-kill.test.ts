import { afterEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import * as netKill from '/main/net-kill'
import { NS } from '@ns'

vi.mock('/scripts/services/web-crawler', () => Mock.WebCrawler)

describe('net-kill', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should target hosts with running scripts', async () => {
        vi.mocked(Mock.Netscript.ps).mockReturnValue(['foo'])
        await netKill.main(Mock.Netscript as unknown as NS)
        const predicate =
            Mock.WebCrawler.Builder.setTargetPredicate.mock.calls[0][0]

        expect(predicate('target')).toBe(true)
    })

    it('should kill processes on the host', async () => {
        vi.mocked(Mock.Netscript.killall).mockReturnValue(true)
        await netKill.main(Mock.Netscript as unknown as NS)
        const onTarget =
            Mock.WebCrawler.Builder.setOnTargetFound.mock.calls[0][0]

        expect(onTarget('target')).toBe(true)
    })
})
