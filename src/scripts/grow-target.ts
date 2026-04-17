import { NS } from '@ns'
import { logExeInfo } from './utils/log-exe-info'
import { ThresholdCalculator } from './utils/threshold-calculator'
import { Logger } from './utils/logger'

/**
 * This script prepares the target server for harvest by growing
 * its money and weakening its security.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const server = ns.getServer(target)
    const thresholder = new ThresholdCalculator(server)
    const logger = Logger.Builder.setLogFn(ns.print).build()

    logExeInfo(ns)
    ns.ui.openTail()

    logger.info('Starting grow/weaken loop...')

    while (true) {
        ns.clearLog()

        if (thresholder.isAtSecurityThreshold()) {
            logger.success(`[${target}] is at or below security threshold`)
        } else {
            logger.info(`Weakening [${target}]...`)
            await ns.weaken(target)
        }

        if (thresholder.isAtMoneyThreshold()) {
            logger.success(`[${target}] is ready for harvest.`)
            logger.success(`Current money: ${server.moneyAvailable}`)
        }

        logger.info('Growing...')
        await ns.grow(target)
    }
}
