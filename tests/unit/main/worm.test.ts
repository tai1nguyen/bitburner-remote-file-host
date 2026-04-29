import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import * as worm from '/main/worm'
import { NS } from '@ns'

vi.mock('/scripts/services/accessor', () => Mock.Accessor)
vi.mock('/scripts/services/file-copier', () => Mock.FileCopier)
vi.mock('/scripts/services/web-crawler', () => Mock.WebCrawler)

describe('Worm', () => {
    const mockPort = { write: vi.fn() }

    beforeEach(() => {
        Mock.Netscript.getPlayer.mockReturnValue({ skills: { hacking: 50 } })

        Mock.Netscript.sleep.mockReturnValue(new Promise(() => {}))
        Mock.Netscript.getPortHandle.mockReturnValue(mockPort)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should crawl the network', async () => {
        Mock.Netscript.getServer.mockReturnValue({ hostname: 'bar' })
        Mock.WebCrawler.getServers.mockReturnValue(new Set(['bar']))

        worm.main(Mock.Netscript as unknown as NS)

        await vi.waitFor(() =>
            expect(mockPort.write).toHaveBeenCalledWith({
                target: 'bar',
                servers: ['bar']
            })
        )
    })

    it('should post the most profitable target and the server list', async () => {
        Mock.Netscript.getServer.mockImplementation((host) => {
            if (host === 'bar') {
                return {
                    moneyMax: 5,
                    requiredHackingSkill: 10,
                    hostname: 'bar'
                }
            }

            return { requiredHackingSkill: 10, hostname: host }
        })

        Mock.WebCrawler.getServers.mockReturnValue(
            new Set(['foo', 'bar', 'faz', 'baz'])
        )

        worm.main(Mock.Netscript as unknown as NS)

        await vi.waitFor(() =>
            expect(mockPort.write).toHaveBeenCalledWith({
                target: 'bar',
                servers: ['foo', 'bar', 'faz', 'baz']
            })
        )
    })

    describe('targets', () => {
        it('should target hosts that are hackable', async () => {
            Mock.Netscript.getServer.mockReturnValue({
                requiredHackingSkill: 10
            })
            Mock.WebCrawler.getServers.mockReturnValue(new Set(['foo']))

            worm.main(Mock.Netscript as unknown as NS)
            await vi.waitFor(() =>
                expect(
                    Mock.WebCrawler.Builder.setTargetPredicate
                ).toHaveBeenCalled()
            )

            const predicate =
                Mock.WebCrawler.Builder.setTargetPredicate.mock.calls[0][0]

            expect(predicate('foo')).toBe(true)
        })

        it('should ignore hosts that are not hackable', async () => {
            Mock.Netscript.getServer.mockReturnValue({
                requiredHackingSkill: 60
            })
            Mock.WebCrawler.getServers.mockReturnValue(new Set(['foo']))

            worm.main(Mock.Netscript as unknown as NS)
            await vi.waitFor(() =>
                expect(
                    Mock.WebCrawler.Builder.setTargetPredicate
                ).toHaveBeenCalled()
            )

            const predicate =
                Mock.WebCrawler.Builder.setTargetPredicate.mock.calls[0][0]

            expect(predicate('foo')).toBe(false)
        })

        it('should treat undefined required hacking skill as 0', async () => {
            Mock.Netscript.getServer.mockReturnValue({})
            Mock.WebCrawler.getServers.mockReturnValue(new Set(['foo']))

            worm.main(Mock.Netscript as unknown as NS)
            await vi.waitFor(() =>
                expect(
                    Mock.WebCrawler.Builder.setTargetPredicate
                ).toHaveBeenCalled()
            )

            const predicate =
                Mock.WebCrawler.Builder.setTargetPredicate.mock.calls[0][0]

            expect(predicate('foo')).toBe(true)
        })
    })

    describe('on target found', () => {
        it('should do nothing if target has been rooted', async () => {
            Mock.Netscript.getServer.mockReturnValue({})
            Mock.Netscript.hasRootAccess.mockReturnValue(true)

            worm.main(Mock.Netscript as unknown as NS)
            await vi.waitFor(() =>
                expect(
                    Mock.WebCrawler.Builder.setOnTargetFound
                ).toHaveBeenCalled()
            )

            const handler =
                Mock.WebCrawler.Builder.setOnTargetFound.mock.calls[0][0]

            expect(handler('foo')).toBe(true)
            expect(Mock.Accessor.getRootAccess).not.toHaveBeenCalled()
            expect(Mock.FileCopier.copyScriptFiles).not.toHaveBeenCalled()
        })

        it('should infect the target', async () => {
            Mock.Netscript.getServer.mockReturnValue({})
            Mock.Netscript.hasRootAccess.mockReturnValue(false)

            worm.main(Mock.Netscript as unknown as NS)
            await vi.waitFor(() =>
                expect(
                    Mock.WebCrawler.Builder.setOnTargetFound
                ).toHaveBeenCalled()
            )

            const handler =
                Mock.WebCrawler.Builder.setOnTargetFound.mock.calls[0][0]

            expect(handler('bar')).toBe(true)
            expect(Mock.Accessor.getRootAccess).toHaveBeenCalledWith('bar')
            expect(Mock.FileCopier.copyScriptFiles).toHaveBeenCalledWith('bar')
        })

        it('should not throw when it fails to infect the host', async () => {
            Mock.Netscript.getServer.mockReturnValue({})
            Mock.Netscript.hasRootAccess.mockReturnValue(false)
            Mock.Accessor.getRootAccess.mockThrow(
                new Error('failed to get access')
            )

            worm.main(Mock.Netscript as unknown as NS)
            await vi.waitFor(() =>
                expect(
                    Mock.WebCrawler.Builder.setOnTargetFound
                ).toHaveBeenCalled()
            )

            const handler =
                Mock.WebCrawler.Builder.setOnTargetFound.mock.calls[0][0]

            expect(() => handler('foo')).not.toThrow()
        })
    })
})
