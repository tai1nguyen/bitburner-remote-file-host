import { NS } from '@ns'
import { logExeInfo } from './utils/log-exe-info'
import { ThresholdCalculator } from './utils/threshold-calculator'
import { Logger } from './utils/logger'

export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const server = ns.getServer(target)
    const thresholder = new ThresholdCalculator(server)
    const logger = Logger.Builder.setLogFn(ns.print).build()

    logExeInfo(ns)
    ns.ui.openTail()

    logger.info('Starting harvest loop...')

    while (true) {
        ns.clearLog()

        if (
            thresholder.isAtMoneyThreshold() &&
            thresholder.isAtSecurityThreshold()
        ) {
            logger.success(`[${target}] is ready for harvest.`)
            logger.info('Harvesting...')
            logger.success(`Harvested $${await ns.hack(target)}.`)
        } else {
            logger.info('Waiting for harvest to be ready...')
            await ns.weaken(target)
        }
    }
}
