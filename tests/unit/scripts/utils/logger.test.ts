import { beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { Logger } from '/scripts/utils/logger'
import { formatErrorStack } from '/scripts/utils/format-error-stack'
import { NS } from '@ns'

vi.mock('/scripts/utils/format-error-stack')

describe('Logger', () => {
    let logger: Logger
    type LogMethods = Omit<Logger, 'toTerminal'>

    beforeEach(() => {
        logger = new Logger(Mock.Netscript as unknown as NS, 'Test')

        vi.mocked(formatErrorStack).mockImplementation((arg) =>
            arg instanceof Error ? arg.message : (arg as string)
        )
    })

    describe.for([
        { logLevel: 'success' },
        { logLevel: 'info' },
        { logLevel: 'warn' },
        { logLevel: 'error' }
    ])('Logger[$logLevel]()', ({ logLevel }: { logLevel: string }) => {
        it(`should log message at '${logLevel}' level`, () => {
            logger[logLevel as keyof LogMethods]('message.')

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.`
                )
            )
        })

        it('should log to terminal', () => {
            logger.toTerminal(true)
            logger[logLevel as keyof LogMethods]('message.')

            expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.`
                )
            )
        })

        it('should log provided object', () => {
            const foo = { foo: 'bar' }
            const stringifiedFoo = JSON.stringify(foo, null, 2)
            logger[logLevel as keyof LogMethods]('message.', foo)

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.\n${stringifiedFoo}`
                )
            )
        })

        it('should log provided runtime error', () => {
            logger[logLevel as keyof LogMethods]('message.', 'error message')

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.\nerror message`
                )
            )
        })

        it('should log provided error', () => {
            logger[logLevel as keyof LogMethods](
                'message.',
                new Error('error message')
            )

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.\nerror message`
                )
            )
        })
    })
})
