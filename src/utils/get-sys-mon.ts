import { NS, Server } from '@ns'
import { Logger } from '/scripts/utils/logger'

/**
 * This script will peridoically print server information for monitoring.
 */
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const server = ns.getServer(target)
    const logger = new Logger(ns)
    ns.disableLog('ALL')
    ns.ui.openTail()
    ns.ui.resizeTail(500, 400)

    let isShowing = false

    const progressText = () => {
        const blank = '              '
        isShowing = !isShowing

        if (isShowing) {
            return `In Progress...`
        }

        return blank
    }

    const getServerMoney = (server: Server) => {
        const maxMoney = ns.formatNumber(server.moneyMax || 0)
        const currentMoney = ns.formatNumber(server.moneyAvailable || 0)

        return `Money: ${currentMoney}/${maxMoney}`
    }

    const getServerSecurity = (server: Server) => {
        const baseSecurity = server.baseDifficulty
        const currentSecurity = Math.floor(server.hackDifficulty || 0)

        return `Security Level: ${currentSecurity}/${baseSecurity} Min: ${server.minDifficulty}`
    }

    const status = () => {
        logger.info('-----------------------------------')
        logger.info(`Monitoring [${progressText()}]`)
        logger.info('-----------------------------------')
        logger.info(`Host: ${server.hostname}`)
        logger.info(`${getServerMoney(server)}`)
        logger.info(`${progressBar(server.moneyAvailable, server.moneyMax)}`)
        logger.info(`${getServerSecurity(server)}`)
        logger.info(
            `${progressBar(server.hackDifficulty, server.baseDifficulty)}`
        )
        logger.info('-----------------------------------')
        logger.info('Hack / Grow / Weaken')
        logger.info('-----------------------------------')
        logger.info(
            `Hack Time: ${Math.floor(ns.getHackTime(server.hostname) / 1000)}s Success Rate: ${ns.formatPercent(ns.hackAnalyzeChance(server.hostname))}`
        )
        logger.info(
            `Grow Time: ${Math.floor(ns.getGrowTime(server.hostname) / 1000)}s Growth Rate: ${server.serverGrowth}`
        )
        logger.info(
            `Weaken Time: ${Math.floor(ns.getWeakenTime(server.hostname) / 1000)}s`
        )
        logger.info('-----------------------------------')
    }

    while (true) {
        ns.clearLog()
        status()
        await ns.sleep(1000)
    }
}

const progressBar = (
    current: number = 0,
    total: number = 0,
    width: number = 25
) => {
    const percent = Math.min(Math.max(current / total, 0), 1)
    const filledLength = Math.round(width * percent)
    const emptyLength = width - filledLength
    const filled = '='.repeat(filledLength)
    const empty = '-'.repeat(emptyLength)

    const bar = `${filled}${empty}`
    const label = Math.round(percent * 100) + '%'

    return `[${bar}] ${label}`
}
