import { NS, Server } from '@ns'
import { ThresholdCalculator } from '/scripts/utils/threshold-calculator'
import { Logger } from '/scripts/utils/logger'

/**
 * Executes grow and weaken to increase the target
 * host money without raising security.
 *
 * @params ns
 * @params target
 */
export const growWeaken = async (ns: NS, target: string) => {
    const server: Server = ns.getServer(target)
    const thresholder: ThresholdCalculator = new ThresholdCalculator(server)
    const logger: Logger = new Logger(ns)

    if (thresholder.isAtSecurityThreshold()) {
        logger.success(`[${target}] is at or below security threshold`)
    }

    if (thresholder.isAtMoneyThreshold()) {
        // Do not waste cycles growing as it
        // will continually increase security levels.
        logger.success(`[${target}] is ready for harvest.`)
        logger.success(`Current money: ${server.moneyAvailable}`)
    } else {
        logger.info('Growing...')
        await ns.grow(target)
    }

    await ns.weaken(target)
}
