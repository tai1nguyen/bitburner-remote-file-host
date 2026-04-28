import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { Logger } from '/scripts/utils/logger'
import { NodeManager } from '/scripts/services/node-manager'

/**
 * This script will read from the WormUpdates queue to determine what host to target.
 * It will then batch grow/weaken/hack attacks against that host using its nodes.
 * If no nodes are present on the network it will default to using other servers
 * on the network as nodes.
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const logger = new Logger(ns)
    const WormUpdates = ns.getPortHandle(1)
    const nodeManager = new NodeManager(ns)

    const isMessage = (
        message: { target: string; servers: string[] } | string
    ) =>
        typeof message !== 'string' &&
        message.target !== undefined &&
        message.servers !== undefined

    while (true) {
        ns.clearLog()
        const message: { target: string; servers: string[] } =
            WormUpdates.read()

        if (isMessage(message)) {
            logger.info(`Handling updates from Worm...`)
            await nodeManager.processUpdates(message.target, message.servers)
        } else {
            // No changes to target host.
            logger.info('Waiting for updates from Worm...')
            await ns.sleep(5000)
        }
    }
}
