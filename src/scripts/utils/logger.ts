import { formatErrorStack } from './format-error-stack'
import { NS } from '@ns'

type LogFunction = (message: string) => void
type LogLevel = 'WARN' | 'INFO' | 'ERROR' | 'SUCCESS'

export class Logger {
    private logPrefix: string
    private logFn: LogFunction
    private terminalLogFn: LogFunction
    private logToTerminal: boolean = false

    public constructor(ns: NS, logPrefix: string = 'Main') {
        this.logFn = ns.print
        this.logPrefix = logPrefix
        this.terminalLogFn = ns.tprint
    }

    public success = (message: string, obj?: unknown) =>
        this.writeLog('SUCCESS', message, obj)

    public info = (message: string, obj?: unknown) =>
        this.writeLog('INFO', message, obj)

    public warn = (message: string, obj?: unknown) =>
        this.writeLog('WARN', message, obj)

    public error = (message: string, obj?: unknown) =>
        this.writeLog('ERROR', message, obj)

    public toTerminal = (toTerminal: boolean) => {
        this.logToTerminal = toTerminal
    }

    private writeLog = (
        logLevel: LogLevel,
        message: string,
        obj: unknown | undefined
    ) => {
        const logMessage = `[${this.logPrefix}]: ${message}`
        const stringifiedObject: string | undefined =
            this.getStringifiedObject(obj)

        const logToWrite = obj
            ? `${logLevel} ${logMessage}\n${stringifiedObject}`
            : `${logLevel} ${logMessage}`

        this.logFn(logToWrite)
        if (this.logToTerminal) this.terminalLogFn(logToWrite)
    }

    private getStringifiedObject = (
        obj: unknown | undefined
    ): string | undefined => {
        // bitburner errors are strings
        const isError = obj instanceof Error || typeof obj === 'string'

        if (obj === undefined) return obj

        if (isError) return formatErrorStack(obj)

        return JSON.stringify(obj, Object.getOwnPropertyNames(obj), 2)
    }
}
