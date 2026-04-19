import { NS, Server, ScriptArg } from '@ns'
import { Logger } from '/scripts/utils/logger'
import { FileCopier } from './file-copier'

type Options = { host: string; target?: string; threads?: number }

export type RunArgs = [
    host: string,
    target: string,
    ExecutorAction,
    ...ScriptArg[]
]

export enum ExecutorAction {
    grow = 'growTarget',
    harvest = 'harvestTarget'
}

export class Executor {
    ns: NS
    logger: Logger

    /**
     * The Executor is responsible for running scripts on the provided host
     * server. It holds all the necessary logic to determine what scripts
     * to run and how to run them.
     *
     * @param ns {NS}
     */
    constructor(ns: NS) {
        this.ns = ns

        this.logger = Logger.Builder.setLogPrefix('Executor')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    /**
     * This method takes an array of arguments and determines what actions to execute.
     * It will then call the corresponding method with the correct options.
     *
     * @param args {RunArgs[]}
     */
    public run = (args: RunArgs) => {
        const host = args[0]
        const target = args[1] === '.' ? host : args[1]
        const action: ExecutorAction = this.getAction(args[2])

        if (!host || !action || !target) {
            this.logger.warn(
                `Invalid arguments: [${JSON.stringify({ host, action, target })}]`
            )
            return
        }

        try {
            this.logger.info(
                `Updating files on ${host === target ? host : target}.`
            )
            new FileCopier(this.ns, target).copyScriptFiles()

            switch (action) {
                case ExecutorAction.grow: {
                    const options: Options = { host, target }
                    this.growTarget(options)
                    break
                }
                case ExecutorAction.harvest: {
                    const options: Options = { host, target }
                    this.harvestTarget(options)
                    break
                }
            }
        } catch (error) {
            this.logger.error(
                `Failed to execute [${action}] on host [${host}] targeting [${target}]:`,
                error
            )
        }
    }

    public growTarget = (options: Options): number => {
        const pathToScript = '/scripts/grow-target.js'
        const hostServer = this.ns.getServer(options.host)
        const target = options.target || hostServer.hostname
        const threadsToUse =
            options.threads || this.getMaxThreads(hostServer, pathToScript)

        if (threadsToUse <= 0) {
            throw new Error(
                `Not enough threads available on ${options.host} to grow ${target}.`
            )
        }

        this.logger.info(
            `Growing ${target} using ${threadsToUse} thread(s) on ${options.host}.`
        )

        const pid = this.ns.exec(
            pathToScript,
            options.host,
            threadsToUse,
            target
        )

        this.logger.info(`Executed with PID: ${pid}`)

        return pid
    }

    public harvestTarget = (options: Options): number => {
        const pathToScript = '/scripts/harvest-target.js'
        const hostServer = this.ns.getServer(options.host)
        const target = options.target || hostServer.hostname
        const threadsToUse =
            options.threads || this.getMaxThreads(hostServer, pathToScript)

        if (threadsToUse <= 0) {
            throw new Error(
                `Not enough threads available on ${options.host} to harvest ${target}.`
            )
        }

        this.logger.info(
            `Harvesting ${target} using ${threadsToUse} thread(s) on ${options.host}.`
        )

        const pid = this.ns.exec(
            pathToScript,
            options.host,
            threadsToUse,
            target
        )

        this.logger.info(`Executed with PID: ${pid}`)

        return pid
    }

    private getMaxThreads = (server: Server, pathToScript: string): number => {
        const ramAvailable = server.maxRam - server.ramUsed
        const ramPerThread = this.ns.getScriptRam(pathToScript)
        const maxThreads = Math.floor(ramAvailable / ramPerThread)

        return maxThreads
    }

    private getMinThreads = (server: Server, pathToScript: string): number => {
        const maxThreads = this.getMaxThreads(server, pathToScript)
        const minThreads = maxThreads >= 1 ? 1 : 0

        return minThreads
    }

    private getAction = (action: string): ExecutorAction =>
        ExecutorAction[action as keyof typeof ExecutorAction]
}
