import { beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks/'
import { Logger } from '/scripts/utils/logger'
import { formatErrorStack } from '/scripts/utils/format-error-stack'

vi.mock('/scripts/utils/format-error-stack')

describe('Logger', () => {
    let logger: Logger

    beforeEach(() => {
        logger = Logger.Builder.setLogFn(Mock.Netscript.print)
            .setTerminalLogFn(Mock.Netscript.tprint)
            .setLogPrefix('Test')
            .build()

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
            logger[logLevel as keyof Logger]('message.')

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.`
                )
            )
        })

        it('should log to terminal', () => {
            logger[logLevel as keyof Logger]('message')

            expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.`
                )
            )
        })

        it('should log provided object', () => {
            const foo = { foo: 'bar' }
            const stringifiedFoo = JSON.stringify(foo, null, 2)
            logger[logLevel as keyof Logger]('message.', foo)

            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.\n${stringifiedFoo}`
                )
            )
        })

        it('should log provided runtime error', () => {
            logger[logLevel as keyof Logger]('message.', 'error message')

            expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.\nerror message`
                )
            )
        })

        it('should log provided error', () => {
            logger[logLevel as keyof Logger](
                'message.',
                new Error('error message')
            )

            expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
                expect.stringContaining(
                    `${logLevel.toUpperCase()} [Test]: message.\nerror message`
                )
            )
        })
    })

    describe('Logger.Builder', () => {
        it('should build the logger', () => {
            const logger = Logger.Builder.setLogFn(vi.fn())
                .setTerminalLogFn(vi.fn())
                .build()

            expect(logger).toBeInstanceOf(Logger)
        })

        it('should throw when the print function is not provided', () => {
            expect(Logger.Builder.build).toThrow()
        })
    })
})
