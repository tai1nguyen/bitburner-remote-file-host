import { NS } from '@ns'
import { logExeInfo } from './utils/log-exe-info'
import { Logger } from './utils/logger'
import { growHackWeaken } from './shared/grow-hack-weaken'

/**
 * This script prepares the target server for harvest by growing
 * its money and weakening its security. When the target is ready
 * it will then hack it.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const logger = new Logger(ns)

    logExeInfo(ns, target)

    logger.info('Starting grow harvest loop...')

    while (true) {
        ns.clearLog()
        await growHackWeaken(ns, target)
    }
}
