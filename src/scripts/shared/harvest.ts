import { NS, Server } from '@ns'
import { ThresholdCalculator } from '/scripts/utils/threshold-calculator'
import { Logger } from '/scripts/utils/logger'

// Hack the target when ready, otherwise weaken the target.
export const harvest = async (ns: NS, target: string) => {
    const server: Server = ns.getServer(target)
    const thresholder: ThresholdCalculator = new ThresholdCalculator(server)
    const logger: Logger = Logger.Builder.setLogFn(ns.print).build()

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
