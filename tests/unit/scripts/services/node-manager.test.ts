import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { NodeManager } from '/scripts/services/node-manager'
import { NS } from '@ns'

vi.mock('/scripts/services/executor', () => Mock.Executor)

describe('NodeManager', () => {
    let manager: NodeManager
    let listOfServers: string[] = []

    beforeEach(() => {
        Mock.Netscript.getScriptRam.mockReturnValue(4)
        Mock.Netscript.getServer.mockReturnValue({ maxRam: 5 })
        Mock.Netscript.sleep.mockResolvedValue(undefined)
        manager = new NodeManager(Mock.Netscript as unknown as NS)
        listOfServers = ['node-1', 'node-2', 'node-3']
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('processUpdates()', () => {
        describe('when there is a new target', () => {
            it('should target nodes against the host', async () => {
                await manager.processUpdates('target', listOfServers)

                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-1',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-2',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-3',
                    target: 'target'
                })
            })

            it('should recalibrate nodes to the new target', async () => {
                await manager.processUpdates('target', listOfServers)

                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-1',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-2',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-3',
                    target: 'target'
                })

                await manager.processUpdates('foo', [])

                expect(Mock.Netscript.killall).toHaveBeenCalledWith('node-1')
                expect(Mock.Netscript.killall).toHaveBeenCalledWith('node-2')
                expect(Mock.Netscript.killall).toHaveBeenCalledWith('node-3')
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-1',
                    target: 'foo'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-2',
                    target: 'foo'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-3',
                    target: 'foo'
                })
            })

            describe('when there are new nodes', () => {
                it('should target new nodes against the host', async () => {
                    await manager.processUpdates('foo', listOfServers)
                    await manager.processUpdates('bar', ['node-4'])

                    expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                        host: 'node-4',
                        target: 'bar'
                    })
                })
            })
        })

        describe('when there is no new target', () => {
            describe('when there are new nodes', () => {
                it('should target new nodes against the target', async () => {
                    await manager.processUpdates('target', listOfServers)
                    await manager.processUpdates('target', ['node-4'])

                    expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                        host: 'node-4',
                        target: 'target'
                    })
                })
            })
        })

        describe('when there are worker nodes', () => {
            it('should use all worker nodes', async () => {
                await manager.processUpdates('target', listOfServers)

                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-1',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-2',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'node-3',
                    target: 'target'
                })
            })
        })

        describe('when there are no worker nodes', () => {
            it('should use network hosts as nodes', async () => {
                await manager.processUpdates('target', ['foo', 'bar', 'faz'])

                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'foo',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'bar',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'faz',
                    target: 'target'
                })
            })

            it('should only use hosts that can run the script', async () => {
                Mock.Netscript.getScriptRam.mockReturnValue(4)
                Mock.Netscript.getServer.mockImplementation((host) => {
                    if (host.includes('foo')) {
                        return { maxRam: 2 }
                    }

                    return { maxRam: 5 }
                })

                await manager.processUpdates('target', ['foo', 'bar', 'faz'])

                expect(Mock.Executor.harvestTarget).not.toHaveBeenCalledWith({
                    host: 'foo',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'bar',
                    target: 'target'
                })
                expect(Mock.Executor.harvestTarget).toHaveBeenCalledWith({
                    host: 'faz',
                    target: 'target'
                })
            })
        })

        it('should ignore executor errors', async () => {
            Mock.Executor.harvestTarget.mockThrow(
                new Error('Failed to harvest')
            )

            await expect(
                manager.processUpdates('target', listOfServers)
            ).resolves.toBeUndefined()
        })
    })
})
