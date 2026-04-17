import { NS, Server, ScriptArg } from '@ns'

type Options = { host: string; target?: string; threads?: number }

type InfectNearbyOptions = Options & { action: ExecutorActions; count: number }

export type RunArgs = [
    host: string,
    target: string,
    ExecutorActions,
    ...ScriptArg[]
]

export enum ExecutorActions {
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
    log: (message: string) => void

    constructor(ns: NS) {
        this.ns = ns
        this.log = (message: string) => {
            this.ns.tprint(`[Executor]: ${message}`)
            this.ns.print(`[Executor]: ${message}`)
        }

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
        const action: ExecutorActions = this.getAction(args[2])

        if (!host || !action || !target) {
            this.log(
                `Invalid arguments: [${JSON.stringify({ host, action, target })}]`
            )
            return
        }

        const isValidInfectArgs = () => {
            const infectAction = args[3] as ExecutorActions
            const count = Number(args[4])

            return infectAction && !isNaN(count)
        }

        try {
            switch (action) {
                case ExecutorActions.grow: {
                    const options: Options = { host, target }

                    this.log(
                        `Attempting to grow target [${options.target}] from host [${options.host}]...`
                    )
                    this.growTarget(options)
                    break
                }
                case ExecutorActions.harvest: {
                    const options: Options = { host, target }

                    this.harvestTarget(options)
                    break
                }
                case ExecutorActions.infect: {
                    if (isValidInfectArgs()) {
                        const infectAction = args[3] as ExecutorActions
                        const options: InfectNearbyOptions = {
                            host,
                            target,
                            action: infectAction,
                            count: Number(args[4])
                        }

                        if (options.count > 1) {
                            this.log(
                                `Attempting to infect ${options.count} server(s) nearby host [${options.host}]`
                            )
                        } else {
                            this.log(
                                `Attempting to infect host [${options.host}]`
                            )
                        }

                        this.log(
                            `Infected will execute action [${options.action}] targeting [${options.target}]`
                        )
                        this.infectNearby(options)
                    } else {
                        this.log(
                            `Invalid arguments for infect action: [${args[3]}, ${args[4]}]`
                        )
                    }

                    break
                }
            }
        } catch (error) {
            this.log(
                `Error executing action [${action}] on host [${host}] targeting [${target}]: ${error?.toString()}`
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

        this.log(
            `Growing ${target} using ${threadsToUse} thread(s) on ${options.host}...`
        )
        const pid = this.ns.exec(
            pathToScript,
            options.host,
            threadsToUse,
            target
        )
        this.log(`Executed with PID: ${pid}`)
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

        this.log(
            `Harvesting ${target} using ${threadsToUse} thread(s) on ${options.host}...`
        )
        const pid = this.ns.exec(
            pathToScript,
            options.host,
            threadsToUse,
            target
        )
        this.log(`Executed with PID: ${pid}`)
    }

    public infectNearby = (options: InfectNearbyOptions) => {
        if (options.action === ExecutorActions.infect) {
            // When the action to execute is also to infect nearby
            // servers the system will infinitely spawn scripts.)
            throw new Error(
                `Cannot infect nearby servers with infected action as [${options.action}]`
            )
        }

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

            const pid = this.ns.exec(
                pathToScript,
                options.host,
                threadsToUse,
                target,
                options.action,
                options.count
            )
            this.log(`Executed with PID: ${pid}`)
        } catch (error) {
            this.log(`${error?.toString()}`)
        }
    }

    private getMaxThreads = (server: Server, pathToScript: string): number => {
        const ramAvailable = server.maxRam - server.ramUsed
        const ramPerThread = this.ns.getScriptRam(pathToScript)
        const maxThreads = Math.floor(ramAvailable / ramPerThread)

        this.log(
            `Checking if host [${server.hostname}] can run [${pathToScript}]`
        )
        this.log(`Script RAM cost: ${ramPerThread}`)
        this.log(`Host RAM available: ${ramAvailable}`)
        this.log(`Max threads available: ${maxThreads}`)

        return maxThreads
    }

    private getMinThreads = (server: Server, pathToScript: string): number => {
        const maxThreads = this.getMaxThreads(server, pathToScript)
        const minThreads = maxThreads >= 1 ? 1 : 0

        return minThreads
    }

    private getAction = (action: string): ExecutorActions =>
        ExecutorActions[action as keyof typeof ExecutorActions]
}
