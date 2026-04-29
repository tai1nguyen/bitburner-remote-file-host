import { NS, Server } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { Logger } from '/scripts/utils/logger'
import { WebCrawler } from '../scripts/services/web-crawler'
import { Accessor } from '/scripts/services/accessor'
import { FileCopier } from '/scripts/services/file-copier'

/**
 * This script will periodically crawl the network and attempt to
 * infect new machines. It will then post the most profitable
 * host to target.
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const logger = new Logger(ns)
    const accessor = new Accessor(ns)
    const fileCopier = new FileCopier(ns)
    const WormUpdates = ns.getPortHandle(1)

    const isHackable = (host: string): boolean =>
        ns.getPlayer().skills.hacking >=
        (ns.getServer(host).requiredHackingSkill || 0)

    const infectTarget = (host: string): boolean => {
        try {
            if (!ns.hasRootAccess(host)) {
                logger.info(`Attempting to infect ${host}`)
                accessor.getRootAccess(host)
                fileCopier.copyScriptFiles(host)
            }

            return true
        } catch (error) {
            logger.error(`Failed to infect ${host}.`, error)

            return false
        }
    }

    const getBestTarget = (listOfServers: Set<string>, ns: NS): string => {
        const servers: Server[] = []

        listOfServers.forEach((host) => {
            servers.push(ns.getServer(host))
        })

        const largestServer = servers.reduce((prev, curr) => {
            const prevServerMaxMoney = prev.moneyMax || 0
            const currServerMaxMoney = curr.moneyMax || 0

            const prevHasMoreTotalMoney =
                prevServerMaxMoney >= currServerMaxMoney

            return prevHasMoreTotalMoney ? prev : curr
        })

        return largestServer.hostname
    }

    while (true) {
        ns.clearLog()
        logger.info('Executing Worm program...')
        const crawler = WebCrawler.Builder.setNetscript(ns)
            .setTargetPredicate(isHackable)
            .setOnTargetFound(infectTarget)
            .build()

        await crawler.start()
        const servers = crawler.getServers()
        const target = getBestTarget(servers, ns)
        const serializeableServers: string[] = []

        servers.forEach((host) => serializeableServers.push(host))

        WormUpdates.write({ target, servers: serializeableServers })

        await ns.sleep(60000)
    }
}
