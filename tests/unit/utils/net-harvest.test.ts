import { afterEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import * as netHarvest from '/utils/net-harvest'
import { NS } from '@ns'

vi.mock('/scripts/services/executor', () => Mock.Executor)
vi.mock('/scripts/services/web-crawler', () => Mock.WebCrawler)

describe('net-harvest-remote', () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    it('should force all network servers to grow the target', async () => {
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue([
            'target',
            'host-1',
            'host-2',
            'host-3'
        ])

        await netHarvest.main(Mock.Netscript as unknown as NS)

        expect(Mock.Executor.growTarget).toHaveBeenCalledWith({
            host: 'target',
            target: 'target'
        })
        expect(Mock.Executor.growTarget).toHaveBeenCalledWith({
            host: 'host-1',
            target: 'target'
        })
        expect(Mock.Executor.growTarget).toHaveBeenCalledWith({
            host: 'host-2',
            target: 'target'
        })
        expect(Mock.Executor.growTarget).toHaveBeenCalledWith({
            host: 'host-3',
            target: 'target'
        })
    })

    it('should execute grow/harvest against the target', async () => {
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue(['target'])

        await netHarvest.main(Mock.Netscript as unknown as NS)

        expect(Mock.Executor.growHarvestTarget).toHaveBeenCalledWith({
            host: 'home',
            target: 'target',
            threads: 100
        })
    })

    it('should only target servers with root access', async () => {
        Mock.Netscript.getServer.mockReturnValue({ hasAdminRights: true })
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue([])
        await netHarvest.main(Mock.Netscript as unknown as NS)
        const predicate =
            Mock.WebCrawler.Builder.setTargetPredicate.mock.calls[0][0]

        expect(predicate('target')).toBe(true)
    })

    it('should not throw', async () => {
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue(['target'])
        Mock.Executor.growTarget.mockThrow(new Error('failed to grow'))

        await expect(
            netHarvest.main(Mock.Netscript as unknown as NS)
        ).resolves.toBeUndefined()
    })
})
