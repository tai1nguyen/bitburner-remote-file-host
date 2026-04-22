import { describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import * as netHarvestRemote from '/utils/net-harvest-remote'
import { NS } from '@ns'

vi.mock('/scripts/services/executor', () => Mock.Executor)
vi.mock('/scripts/services/web-crawler', () => Mock.WebCrawler)

describe('net-harvest-remote', () => {
    it('should force all network servers to grow the target', async () => {
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue([
            'target',
            'host-1',
            'host-2',
            'host-3'
        ])

        await netHarvestRemote.main(Mock.Netscript as unknown as NS)

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

    it('should execute harvest against the target', async () => {
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue(['target'])

        await netHarvestRemote.main(Mock.Netscript as unknown as NS)

        expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
            host: 'home',
            target: 'target'
        })
    })

    it('should not throw', () => {
        Mock.WebCrawler.getBestTarget.mockReturnValue('target')
        Mock.WebCrawler.getServers.mockReturnValue(['target'])
        Mock.Executor.growTarget.mockThrow(new Error('failed to grow'))

        expect(
            netHarvestRemote.main(Mock.Netscript as unknown as NS)
        ).resolves.toBeUndefined()
    })
})
