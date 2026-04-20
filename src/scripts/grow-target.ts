import { NS } from '@ns'
import { logExeInfo } from './utils/log-exe-info'
import { Logger } from './utils/logger'
import { grow } from './shared/grow'

/**
 * This script prepares the target server for harvest by growing
 * its money and weakening its security.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const logger = Logger.Builder.setLogFn(ns.print).build()

    logExeInfo(ns)

    logger.info('Starting grow loop...')

    while (true) {
        ns.clearLog()
        await grow(ns, target)
    }
}
