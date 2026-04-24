import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { Executor, RunArgs } from '/scripts/services/executor'
import { NS } from '@ns'

vi.mock('/scripts/services/file-copier', () => Mock.FileCopier)

describe('Executor', () => {
    let executor: Executor

    beforeEach(() => {
        executor = new Executor(Mock.Netscript as unknown as NS)
        Mock.Netscript.exec.mockReturnValue(1)
        Mock.Netscript.getScriptRam.mockReturnValue(2)
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'target',
            maxRam: 5,
            ramUsed: 1
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('run()', () => {
        it('should execute the grow script', () => {
            const args = ['host', 'target', 'grow']

            executor.run(args as RunArgs)

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/grow-target.js',
                'host',
                2,
                'target'
            )
        })

        it('should execute the harvest', () => {
            const args = ['host', 'target', 'harvest']

            executor.run(args as RunArgs)

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/harvest-target.js',
                'host',
                2,
                'target'
            )
        })

        it('should execute target script with the host as the target', () => {
            const args = ['target', '.', 'grow']

            executor.run(args as RunArgs)

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/grow-target.js',
                'target',
                2,
                'target'
            )
        })

        it('should log when exec fails', () => {
            const args = ['host', 'target', 'grow']
            Mock.Netscript.exec.mockThrow(new Error('Failed to execute'))

            executor.run(args as RunArgs)

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining('ERROR')
            )
        })

        it.for([
            { text: 'no host', args: ['', '.', 'grow'] },
            { text: 'no target', args: ['host', '', 'grow'] },
            { text: 'no action', args: ['host', 'target', ''] }
        ])(
            'should ignore request when args have: $text',
            ({ args }: { text: string; args: string[] }) => {
                executor.run(args as RunArgs)

                expect(Mock.Netscript.exec).not.toHaveBeenCalled()
            }
        )
    })

    describe('growTarget()', () => {
        it('should execute the grow script', () => {
            executor.growTarget({ host: 'host', target: 'target', threads: 1 })

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/grow-target.js',
                'host',
                1,
                'target'
            )
        })

        it('should target the host when a target is not provided', () => {
            executor.growTarget({ host: 'target', threads: 1 })

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/grow-target.js',
                'target',
                1,
                'target'
            )
        })

        it('should throw when the script cannot be executed', () => {
            Mock.Netscript.getScriptRam.mockReturnValue(2)
            Mock.Netscript.getServer.mockReturnValue({
                hostname: 'target',
                maxRam: 1,
                ramUsed: 1
            })

            expect(() => executor.growTarget({ host: 'host', target: 'target' })).toThrow()
        })

        it('should return the pid', () => {
            const result = executor.growTarget({ host: 'host', target: 'target', threads: 1 })

            expect(result).toBe(1)
        })
    })

    describe('harvestTarget()', () => {
        it('should execute the grow script', () => {
            executor.harvestTarget({ host: 'host', target: 'target', threads: 1 })

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/harvest-target.js',
                'host',
                1,
                'target'
            )
        })

        it('should target the host when a target is not provided', () => {
            executor.harvestTarget({ host: 'target', threads: 1 })

            expect(Mock.Netscript.exec).toHaveBeenCalledWith(
                '/scripts/harvest-target.js',
                'target',
                1,
                'target'
            )
        })

        it('should throw when the script cannot be executed', () => {
            Mock.Netscript.getScriptRam.mockReturnValue(2)
            Mock.Netscript.getServer.mockReturnValue({
                hostname: 'target',
                maxRam: 1,
                ramUsed: 1
            })

            expect(() => executor.harvestTarget({ host: 'host', target: 'target' })).toThrow()
        })

        it('should return the pid', () => {
            const result = executor.harvestTarget({ host: 'host', target: 'target', threads: 1 })

            expect(result).toBe(1)
        })
    })
})
