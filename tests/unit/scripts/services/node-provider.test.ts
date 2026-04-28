import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NodeProvider } from '/scripts/services/node-provider'
import Mock from '/mocks'
import { NS } from '@ns'

describe('NodeManager', () => {
    let provider: NodeProvider

    beforeEach(() => {
        Mock.Netscript.getPlayer.mockReturnValue({ money: 100 })
        Mock.Netscript.getPurchasedServerCost.mockImplementation((ram) =>
            ram === 8 ? 80 : 110
        )

        provider = new NodeProvider(Mock.Netscript as unknown as NS)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getNodes()', () => {
        describe('when it is using network nodes', () => {
            it('should only get nodes that can run the script', () => {
                const servers = ['foo', 'bar']
                Mock.Netscript.getPurchasedServerCost.mockReturnValue(110)
                Mock.Netscript.getScriptRam.mockReturnValue(4)
                Mock.Netscript.getServer.mockImplementation((host) =>
                    host === 'foo' ? { maxRam: 4 } : { maxRam: 3 }
                )

                const nodes = provider.getNodes(['faz'], servers)

                expect(nodes).toContain('foo')
            })
        })

        describe('when it is using worker nodes', () => {
            it('should buy new servers using the existing server ram level', () => {
                Mock.Netscript.getPurchasedServerLimit.mockReturnValue(4)
                Mock.Netscript.purchaseServer.mockReturnValue('node-worker')
                Mock.Netscript.getServer.mockImplementation((host) =>
                    host === 'node-1' ? { maxRam: 16 } : { maxRam: 4 }
                )

                provider.getNodes(['node', 'node-1', 'node-2'], [])

                expect(Mock.Netscript.purchaseServer).toHaveBeenCalledWith(
                    'node-worker',
                    16
                )
            })

            it('should not purchase anymore servers if at the server limit', () => {
                Mock.Netscript.getPurchasedServerLimit.mockReturnValue(1)
                const nodes = provider.getNodes(['node'], [])

                expect(nodes.length).toBe(1)
                expect(nodes).toContain('node')
            })
        })

        describe('when it is able to buy worker nodes', () => {
            it('should buy new node', () => {
                Mock.Netscript.getPurchasedServerLimit.mockReturnValue(1)
                Mock.Netscript.purchaseServer.mockReturnValue('node')

                const nodes = provider.getNodes([], [])

                expect(nodes).toContain('node')
            })

            it('should buy nodes until it reaches the server limit', () => {
                Mock.Netscript.getPurchasedServerLimit.mockReturnValue(2)
                Mock.Netscript.purchaseServer.mockReturnValue('node-worker')

                const nodes = provider.getNodes([], [])

                expect(nodes.length).toBe(2)
            })

            it('should stop buying nodes at the first node purchase failure', () => {
                Mock.Netscript.getPurchasedServerLimit.mockReturnValue(2)
                Mock.Netscript.purchaseServer.mockReturnValue('')

                const nodes = provider.getNodes([], [])

                expect(nodes.length).toBe(0)
            })
        })
    })

    describe('upgradeNodes()', () => {
        it('should do nothing if not using worker nodes', () => {
            expect(provider.upgradeNodes(['foo']).length).toBe(0)
        })

        it('should do nothing when given no nodes', () => {
            expect(provider.upgradeNodes([]).length).toBe(0)
        })

        describe('when nodes are all using the same amount of ram', () => {
            it('should upgrade nodes to the greatest amount of ram purchasable', () => {
                Mock.Netscript.upgradePurchasedServer.mockImplementation(
                    (host) => host
                )
                Mock.Netscript.getServer.mockReturnValue({ maxRam: 4 })

                const nodes = provider.upgradeNodes(['node-1', 'node-2'])

                expect(
                    Mock.Netscript.upgradePurchasedServer
                ).toHaveBeenCalledWith('node-1', 8)
                expect(
                    Mock.Netscript.upgradePurchasedServer
                ).toHaveBeenCalledWith('node-2', 8)
                expect(nodes).toStrictEqual(['node-1', 'node-2'])
            })
        })

        describe('when nodes are on different amounts of ram', () => {
            it('should upgrade nodes to all use the largest amount of ram', () => {
                Mock.Netscript.upgradePurchasedServer.mockImplementation(
                    (host) => host
                )
                Mock.Netscript.getServer.mockImplementation((host) =>
                    host === 'node-1' ? { maxRam: 16 } : { maxRam: 8 }
                )

                const nodes = provider.upgradeNodes(['node-1', 'node-2'])

                expect(
                    Mock.Netscript.upgradePurchasedServer
                ).toHaveBeenCalledWith('node-2', 16)
                expect(nodes).toStrictEqual(['node-2'])
            })
        })

        it('should do nothing if there are no purchasable ram upgrades', () => {
            Mock.Netscript.getServer.mockReturnValue({ maxRam: 8 })
            Mock.Netscript.getPurchasedServerCost.mockReturnValue(110)

            const nodes = provider.upgradeNodes(['node-1'])

            expect(nodes.length).toBe(0)
        })

        it('should stop when an upgrade attempt fails', () => {
            Mock.Netscript.upgradePurchasedServer.mockImplementation((host) =>
                host === 'node-2' ? '' : host
            )
            Mock.Netscript.getServer.mockReturnValue({ maxRam: 4 })

            const nodes = provider.upgradeNodes(['node-1', 'node-2'])

            expect(nodes.length).toBe(1)
            expect(nodes).toContain('node-1')
        })
    })
})
