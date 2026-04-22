import { afterEach, describe, expect, it, vi } from 'vitest'
import { NS } from '@ns'
import Mock from '/mocks'
import { Accessor } from '/scripts/services/accessor'

vi.mock('/scripts/utils/logger', () => Mock.Logger)

describe('Accessor', () => {
    describe('getRootAccess()', () => {
        const executables = [
            { name: 'brutessh', fileName: 'BruteSSH.exe' },
            { name: 'ftpcrack', fileName: 'FTPCrack.exe' },
            { name: 'relaysmtp', fileName: 'relaySMTP.exe' },
            { name: 'httpworm', fileName: 'HTTPWorm.exe' },
            { name: 'sqlinject', fileName: 'SQLInject.exe' }
        ]

        afterEach(() => {
            vi.resetAllMocks()
        })

        it.for(executables)(
            'should open ports with [$fileName]',
            ({ name }: { name: string }) => {
                const key = name as keyof typeof Mock.Netscript
                const mockFn = Mock.Netscript[key]
                vi.mocked(Mock.Netscript.fileExists).mockReturnValue(true)

                new Accessor(Mock.Netscript as unknown as NS).getRootAccess(
                    'target'
                )

                expect(mockFn).toHaveBeenCalledWith('target')
            }
        )

        it.for(executables)(
            'should not throw when [$fileName] fails',
            ({ name }: { name: string }) => {
                const key = name as keyof typeof Mock.Netscript
                const mockFn = Mock.Netscript[key] as typeof vi.fn
                vi.mocked(mockFn).mockThrow(new Error(`${name} failed`))
                vi.mocked(Mock.Netscript.fileExists).mockReturnValue(true)

                expect(() =>
                    new Accessor(Mock.Netscript as unknown as NS).getRootAccess(
                        'target'
                    )
                ).not.toThrow()
            }
        )

        it.for(executables)(
            'should not run [$fileName] when it does not exist',
            ({ name }: { name: string }) => {
                const key = name as keyof typeof Mock.Netscript
                const mockFn = Mock.Netscript[key]
                vi.mocked(Mock.Netscript.fileExists).mockReturnValue(false)

                new Accessor(Mock.Netscript as unknown as NS).getRootAccess(
                    'target'
                )

                expect(mockFn).not.toHaveBeenCalled()
            }
        )

        it('should call to nuke the server', () => {
            vi.mocked(Mock.Netscript.fileExists).mockReturnValue(true)

            new Accessor(Mock.Netscript as unknown as NS).getRootAccess(
                'target'
            )

            expect(Mock.Netscript.nuke).toHaveBeenCalledWith('target')
        })

        it('should throw when the nuke fails', () => {
            vi.mocked(Mock.Netscript.fileExists).mockReturnValue(true)
            vi.mocked(Mock.Netscript.nuke).mockThrow(
                new Error('Failed to nuke')
            )

            expect(() =>
                new Accessor(Mock.Netscript as unknown as NS).getRootAccess(
                    'target'
                )
            ).toThrow('Failed to get root access on: target.')
        })
    })

    describe('logToTerminal()', () => {
        it('should toggle logs to go to the terminal', () => {
            new Accessor(Mock.Netscript as unknown as NS).logToTerminal(true)

            expect(Mock.Logger.toTerminal).toHaveBeenCalledWith(true)
        })
    })
})
