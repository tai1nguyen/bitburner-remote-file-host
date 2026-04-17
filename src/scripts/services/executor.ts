import { NS, Server, ScriptArg } from '@ns'
import { Logger } from '/scripts/utils/logger'

type Options = { host: string; target?: string; threads?: number }

type InfectNearbyOptions = Options & { action: ExecutorAction; count: number }

export type RunArgs = [
    host: string,
    target: string,
    ExecutorAction,
    ...ScriptArg[]
]

export enum ExecutorAction {
    grow = 'growTarget',
    harvest = 'harvestTarget',
    infect = 'infectNearby'
}

/**
 * The Executor is responsible for running scripts. It holds all
 * the necessary logic to determine what scripts to run.
 *
 * @param ns {NS}
 */
export class Executor {
    ns: NS
    logger: Logger

    constructor(ns: NS) {
        this.ns = ns

        this.logger = Logger.Builder.setLogPrefix('Executor')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    /**
     * The method takes an array of arguments and determines what actions to execute.
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

        const isValidInfectArgs = () => {
            const infectAction = args[3] as ExecutorAction
            const count = Number(args[4])

            return infectAction && !isNaN(count)
        }

        // TODO: Copy all local scripts to the host. Ensures
        // that the host always has the latest scripts to run.

        try {
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
                case ExecutorAction.infect: {
                    if (isValidInfectArgs()) {
                        const infectAction = args[3] as ExecutorAction
                        const options: InfectNearbyOptions = {
                            host,
                            target,
                            action: infectAction,
                            count: Number(args[4])
                        }

                        this.infectNearby(options)
                    } else {
                        this.logger.error(
                            `Invalid arguments for infect action: [${args[3]}, ${args[4]}]`
                        )
                    }

                    break
                }
            }
        } catch (error) {
            this.logger.error(
                `Error executing [${action}] on host [${host}] targeting [${target}]`,
                error as object
            )
        }
    }

    public growTarget = (options: Options) => {
        const pathToScript = '/scripts/grow-target.js'
        const hostServer = this.ns.getServer(options.host)
        const target = options.target || hostServer.hostname
        const threadsToUse =
            options.threads || this.getMaxThreads(hostServer, pathToScript)

        if (threadsToUse <= 0) {
            throw new Error(
                `Not enough threads available on ${options.host} to grow ${target}...`
            )
        }

        this.logger.info(
            `Growing ${target} using ${threadsToUse} thread(s) on ${options.host}...`
        )

        const pid = this.ns.exec(
            pathToScript,
            options.host,
            threadsToUse,
            target
        )

        this.logger.info(`Executed with PID: ${pid}`)
    }

    public harvestTarget = (options: Options) => {
        const pathToScript = '/scripts/harvest-target.js'
        const hostServer = this.ns.getServer(options.host)
        const target = options.target || hostServer.hostname
        const threadsToUse =
            options.threads || this.getMaxThreads(hostServer, pathToScript)

        if (threadsToUse <= 0) {
            throw new Error(
                `Not enough threads available on ${options.host} to harvest ${target}...`
            )
        }

        this.logger.info(
            `Harvesting ${target} using ${threadsToUse} thread(s) on ${options.host}...`
        )

        const pid = this.ns.exec(
            pathToScript,
            options.host,
            threadsToUse,
            target
        )

        this.logger.info(`Executed with PID: ${pid}`)
    }

    public infectNearby = (options: InfectNearbyOptions) => {
        // TODO: add better handling for when we only want to infect a single server

        if (options.action === ExecutorAction.infect) {
            // When the action to execute is also to infect nearby
            // servers the system will infinitely spawn scripts.)
            throw new Error(
                `Cannot infect nearby servers with infected action as [${options.action}]`
            )
        }

        if (options.count > 1) {
            this.logger.info(
                `Infect ${options.count} server(s) nearby host [${options.host}]...`
            )
        } else {
            this.logger.info(`Infect host [${options.host}]...`)
        }

        this.logger.info(
            `Infected servers will execute [${options.action}] targeting [${options.target}]`
        )

        try {
            const pathToScript = '/scripts/infect-nearby.js'
            const hostServer = this.ns.getServer(options.host)
            const target = options.target || hostServer.hostname
            const threadsToUse =
                options.threads || this.getMinThreads(hostServer, pathToScript)

            if (threadsToUse <= 0) {
                throw new Error(
                    `Not enough threads available on ${options.host} to infect nearby servers...`
                )
            }

            this.logger.info(`executing infect using ${threadsToUse} threads.`)

            const pid = this.ns.exec(
                pathToScript,
                options.host,
                threadsToUse,
                target,
                options.action,
                options.count
            )
            this.logger.info(`Executed with PID: ${pid}`)
        } catch (error) {
            this.logger.error(`Failed to execute infect`, error)
        }
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
