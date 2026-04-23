import { NS, Server } from '@ns'
import { ThresholdCalculator } from '/scripts/utils/threshold-calculator'
import { Logger } from '/scripts/utils/logger'

/**
 * Executes the grow > weaken > hack > weaken cycle.
 */
export const growHackWeaken = async (ns: NS, target: string) => {
    const server: Server = ns.getServer(target)
    const thresholder: ThresholdCalculator = new ThresholdCalculator(server)
    const logger: Logger = new Logger(ns)

    logger.info(`Growing [${target}]...`)
    await ns.grow(target)
    await ns.weaken(target)

    if (
        thresholder.isAtMoneyThreshold() &&
        thresholder.isAtSecurityThreshold()
    ) {
        logger.success(`[${target}] is ready for harvest.`)
        logger.success(`Current money: ${server.moneyAvailable}`)
        logger.info(`Harvesting [${target}]...`)
        await ns.hack(target)
    }

    logger.info(`Weakening [${target}]...`)
    await ns.weaken(target)
}
