type LogFunction = (message: string) => void
type LogLevel = 'WARN' | 'INFO' | 'ERROR' | 'SUCCESS'

export class Logger {
    private logPrefix: string
    private logFn: LogFunction
    private terminalLogFn?: LogFunction

    private constructor(
        logPrefix: string = 'Main',
        logFn: LogFunction,
        terminalLogFn?: LogFunction
    ) {
        this.logFn = logFn
        this.logPrefix = logPrefix
        this.terminalLogFn = terminalLogFn
    }

    public success = (message: string, obj?: unknown) =>
        this.writeLog('SUCCESS', message, obj)

    public info = (message: string, obj?: unknown) =>
        this.writeLog('INFO', message, obj)

    public warn = (message: string, obj?: unknown) =>
        this.writeLog('WARN', message, obj)

    public error = (message: string, obj?: unknown) =>
        this.writeLog('ERROR', message, obj)

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
        this.terminalLogFn?.(logToWrite)
    }

    private getStringifiedObject = (
        obj: unknown | undefined
    ): string | undefined => {
        if (obj === undefined) return obj

        return JSON.stringify(obj, Object.getOwnPropertyNames(obj), 2)
    }

    public static get Builder() {
        return new Logger.LoggerBuilder()
    }

    private static LoggerBuilder = class {
        private logPrefix?: string
        private logFn?: LogFunction
        private terminalLogFn?: LogFunction

        setLogPrefix = (logPrefix: string) => {
            this.logPrefix = logPrefix
            return this
        }

        /**
         * Sets the method used for printing to the terminal.
         */
        setTerminalLogFn = (logFn: LogFunction) => {
            this.terminalLogFn = logFn
            return this
        }

        /**
         * Sets the method used for printing to the tail logs.
         */
        setLogFn = (logFn: LogFunction) => {
            this.logFn = logFn
            return this
        }

        build = (): Logger => {
            if (!this.logFn) {
                throw new Error('Logger has no script log method set.')
            }

            return new Logger(this.logPrefix, this.logFn!, this.terminalLogFn)
        }
    }
}
