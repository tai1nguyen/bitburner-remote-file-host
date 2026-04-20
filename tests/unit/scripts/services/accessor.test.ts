import { afterEach, describe, expect, it, vi, Mock } from 'vitest'
import { NS } from '@ns'
import Mocks from '/mocks'
import { Accessor } from '/scripts/services/accessor'

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
                const key = name as keyof typeof Mocks.Netscript
                const mockFn = Mocks.Netscript[key] as Mock
                vi.mocked(Mocks.Netscript.fileExists).mockReturnValue(true)

                new Accessor(
                    Mocks.Netscript as unknown as NS,
                    'target'
                ).getRootAccess()

                expect(mockFn).toHaveBeenCalledWith('target')
            }
        )

        it.for(executables)(
            'should not throw when [$fileName] fails',
            ({ name }: { name: string }) => {
                const key = name as keyof typeof Mocks.Netscript
                const mockFn = Mocks.Netscript[key] as Mock
                vi.mocked(mockFn).mockThrow(new Error(`${name} failed`))
                vi.mocked(Mocks.Netscript.fileExists).mockReturnValue(true)

                expect(
                    new Accessor(Mocks.Netscript as unknown as NS, 'target')
                        .getRootAccess
                ).not.toThrow()
            }
        )

        it.for(executables)(
            'should not run [$fileName] when it does not exist',
            ({ name }: { name: string }) => {
                const key = name as keyof typeof Mocks.Netscript
                const mockFn = Mocks.Netscript[key] as Mock
                vi.mocked(Mocks.Netscript.fileExists).mockReturnValue(false)

                new Accessor(
                    Mocks.Netscript as unknown as NS,
                    'target'
                ).getRootAccess()

                expect(mockFn).not.toHaveBeenCalled()
            }
        )

        it('should call to nuke the server', () => {
            vi.mocked(Mocks.Netscript.fileExists).mockReturnValue(true)

            new Accessor(
                Mocks.Netscript as unknown as NS,
                'target'
            ).getRootAccess()

            expect(Mocks.Netscript.nuke).toHaveBeenCalledWith('target')
        })

        it('should throw when the nuke fails', () => {
            vi.mocked(Mocks.Netscript.fileExists).mockReturnValue(true)
            vi.mocked(Mocks.Netscript.nuke).mockThrow(
                new Error('Failed to nuke')
            )

            expect(
                new Accessor(Mocks.Netscript as unknown as NS, 'target')
                    .getRootAccess
            ).toThrow('Failed to get root access on: target.')
        })
    })
})
