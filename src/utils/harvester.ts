import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { Logger } from '/scripts/utils/logger'
import { Executor } from '/scripts/services/executor'

/**
 * This script will read from the harvestQueue to determine what host to target.
 * It will then batch grow/weaken/hack attacks against that host using its nodes.
 * If no nodes are present on the network it will default to using other servers
 * on the network as nodes.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const executor = new Executor(ns)
    const logger = new Logger(ns)
    const harvesterQueue = ns.getPortHandle(1)

    const getNodes = (servers: string[]) => {
        const nodeSuspects: string[] = []
        const isNode = (host: string) => host.includes('node')
        const hasNodes = (hosts: string[]) => {
            // nodes in this case are owned servers,
            // not hosts on the network.
            return hosts.filter(isNode).length > 0
        }

        servers.forEach((host) => nodeSuspects.push(host))

        if (hasNodes(nodeSuspects)) {
            // use all nodes available.
            return nodeSuspects.filter(isNode)
        } else {
            // use the first 15 hosts as nodes.
            return nodeSuspects.slice(0, 15)
        }
    }

    const isNewTarget = (
        message: { target: string; servers: string[] } | string,
        currentTarget: string | undefined
    ) => {
        if (
            typeof message !== 'string' &&
            message.target !== undefined &&
            message.target !== currentTarget
        ) {
            return true
        }

        return false
    }

    let currentTarget: string | undefined = undefined
    let currentNodesInUse: string[] = []

    while (true) {
        const message: { target: string; servers: string[] } =
            harvesterQueue.read()

        if (isNewTarget(message, currentTarget)) {
            logger.info(`New target for harvest received: [${message.target}]`)

            logger.info('Getting nodes to use...')
            const nodes = getNodes(message.servers)

            logger.info('Killing existing node processes...')
            currentNodesInUse.forEach((host) => {
                logger.info(`Killing process in ${host}`)
                ns.killall(host)
            })

            logger.info(
                `Harvesting ${message.target} with ${nodes.length} node(s).`
            )

            for (const node of nodes) {
                try {
                    ns.killall(node)
                    executor.harvestTarget({
                        host: node,
                        target: message.target
                    })
                } catch (error) {
                    logger.warn(`Failed to execute harvest.`, error)
                }

                await ns.sleep(500)
            }

            currentTarget = message.target
            currentNodesInUse = nodes
        } else {
            // No changes to target host.
            logger.info('No changes to target detected...')
            await ns.sleep(5000)
        }
    }
}
