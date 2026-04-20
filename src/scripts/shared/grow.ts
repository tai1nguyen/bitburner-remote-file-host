import { NS, Server } from '@ns'
import { ThresholdCalculator } from '/scripts/utils/threshold-calculator'
import { Logger } from '/scripts/utils/logger'

// Each call to ns.grow will increase both server money and security
// level. Therefore, ns.weaken must be call after each grow cycle to
// counter act this side effect.
export const grow = async (ns: NS, target: string) => {
    const server: Server = ns.getServer(target)
    const thresholder: ThresholdCalculator = new ThresholdCalculator(server)
    const logger: Logger = Logger.Builder.setLogFn(ns.print).build()

    if (thresholder.isAtMoneyThreshold()) {
        // Do not waste cycles growing as it
        // will continually increase security levels.
        logger.success(`[${target}] is ready for harvest.`)
        logger.success(`Current money: ${server.moneyAvailable}`)
    } else {
        logger.info('Growing...')
        await ns.grow(target)
    }

    if (thresholder.isAtSecurityThreshold()) {
        logger.success(`[${target}] is at or below security threshold`)
    }

    logger.info(`Weakening [${target}]...`)
    await ns.weaken(target)
}
