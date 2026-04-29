import { describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import * as mastermind from '/main/mastermind'
import { NS } from '@ns'

vi.mock('/scripts/services/node-manager', () => Mock.NodeManager)

describe('mastermind', () => {
    describe('when there is a message in the queue', () => {
        type QueueMessage = { target?: string; servers?: string[] } | string

        it.for([
            { message: 'not a message' },
            { message: { target: undefined, servers: [] } },
            { message: { target: 'foo', servers: undefined } }
        ])(
            'it should ignore invalid messages',
            async ({ message }: { message: QueueMessage }) => {
                const mockPort = { read: vi.fn() }
                mockPort.read.mockReturnValue(message)
                Mock.Netscript.getPortHandle.mockReturnValue(mockPort)
                Mock.Netscript.sleep.mockReturnValue(new Promise(() => {}))

                mastermind.main(Mock.Netscript as unknown as NS)

                await vi.waitFor(() =>
                    expect(Mock.Netscript.sleep).toHaveBeenCalled()
                )
                expect(Mock.NodeManager.processUpdates).not.toHaveBeenCalled()
            }
        )

        it('should process updates', async () => {
            const message = { target: 'foo', servers: ['foo', 'bar'] }
            const mockPort = { read: vi.fn() }
            mockPort.read.mockReturnValue(message)
            Mock.Netscript.getPortHandle.mockReturnValue(mockPort)
            Mock.NodeManager.processUpdates.mockReturnValue(
                new Promise(() => {})
            )

            mastermind.main(Mock.Netscript as unknown as NS)

            await vi.waitFor(() =>
                expect(Mock.NodeManager.processUpdates).toHaveBeenCalled()
            )
            expect(Mock.NodeManager.processUpdates).toHaveBeenCalledWith(
                message.target,
                message.servers
            )
        })
    })

    describe('when there is no message in the queue', () => {
        it('should wait for updates', async () => {
            const mockPort = { read: vi.fn() }
            mockPort.read.mockReturnValue('is not a message')
            Mock.Netscript.getPortHandle.mockReturnValue(mockPort)
            Mock.Netscript.sleep.mockReturnValue(new Promise(() => {}))

            mastermind.main(Mock.Netscript as unknown as NS)

            await vi.waitFor(() =>
                expect(Mock.Netscript.sleep).toHaveBeenCalled()
            )
        })
    })
})
