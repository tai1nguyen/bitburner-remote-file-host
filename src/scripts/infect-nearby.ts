import { NS } from '@ns'
import { Infector } from './services/infector'
import { Executor, RunArgs } from './services/executor'
import { logExeInfo } from './utils/log-exe-info'
import { Logger } from './utils/logger'

/**
 * This script attempts to gain access to servers neighboring the host running
 * it. Once access is gained it will then execute the provided action against the
 * targeted server.
 *
 * NOTE: The host running this script will never execute the provided action. It
 * only delegates the execution to neighboring servers.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const action = ns.args[1] as string
    const count = ns.args[2] as number
    const logger = Logger.Builder.setLogFn(ns.print)
        .setTerminalLogFn(ns.tprint)
        .build()

    logExeInfo(ns)

    logger.info(
        `Looking to execute [${action}] with x${count} server(s) targeting [${target}].`
    )

    const serversToInfect = ns
        .scan()
        .map((serverName) => {
            const isRunningScripts = ns.ps(serverName).length > 0
            logger.info(`Found server [${serverName}].`)

            if (serverName === 'home') {
                logger.warn(`Ignoring [${serverName}], cannot infect home.`)
                return null
            }

            if (isRunningScripts) {
                logger.warn(
                    `Ignoring [${serverName}], already running scripts.`
                )
                return null
            }

            return ns.getServer(serverName)
        })
        .filter((server) => server !== null)
        .slice(0, count)

    logger.success(
        `Neighboring servers: [${serversToInfect.map((server) => server.hostname).join(', ')}].`
    )

    for (const server of serversToInfect) {
        try {
            if (!server.hasAdminRights) {
                new Infector(ns).infect(server)
            }

            logger.info(
                `Executing action [${action}] on host [${server.hostname}] targeting [${target}].`
            )
            new Executor(ns).run([server.hostname, target, action] as RunArgs)
        } catch (error) {
            logger.error(`Failed to infect ${server.hostname}`, error)
        }
    }
}
