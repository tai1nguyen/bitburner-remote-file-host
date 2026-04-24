import { NS } from '@ns'
import { logExeInfo } from './utils/log-exe-info'
import { Logger } from './utils/logger'
import { growWeaken } from './shared/grow-weaken'

/**
 * This script prepares the target server for harvest by growing
 * its money and weakening its security.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const logger = new Logger(ns)

    logExeInfo(ns, target)

    logger.info('Starting grow loop...')

    while (true) {
        ns.clearLog()
        await growWeaken(ns, target)
    }
}
