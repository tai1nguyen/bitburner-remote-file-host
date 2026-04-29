import { NS, Server } from '@ns'
import { ThresholdCalculator } from '/scripts/utils/threshold-calculator'
import { Logger } from '/scripts/utils/logger'

/**
 * Executes the grow > hack > weaken cycle against the provided target.
 *
 * @param ns
 * @param target
 */
export const growHackWeaken = async (ns: NS, target: string) => {
    const server: Server = ns.getServer(target)
    const thresholder: ThresholdCalculator = new ThresholdCalculator(server)
    const logger: Logger = new Logger(ns)

    if (!thresholder.isAtSecurityThreshold()) {
        logger.info(`Weakening [${target}]...`)
        await ns.weaken(target)
        return
    }

    if (!thresholder.isAtMoneyThreshold()) {
        logger.info(`Growing [${target}]...`)

        await ns.grow(target)
        return
    }

    logger.success(`[${target}] is ready for harvest.`)
    logger.success(`Current money: ${server.moneyAvailable}`)
    logger.info(`Harvesting [${target}]...`)
    await ns.hack(target)
}
