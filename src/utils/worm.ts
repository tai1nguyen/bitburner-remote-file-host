import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { Logger } from '/scripts/utils/logger'
import { WebCrawler } from '../scripts/services/web-crawler'
import { Accessor } from '/scripts/services/accessor'
import { FileCopier } from '/scripts/services/file-copier'
import { getBestTarget } from '/scripts/utils/get-best-target'

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
    const harvestQueue = ns.getPortHandle(1)

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

    while (true) {
        ns.clearLog()
        logger.info('Executing Worm program...')
        const crawler = WebCrawler.Builder.setNetscript(ns)
            .setOnTargetFound(infectTarget)
            .build()

        await crawler.start()
        const servers = crawler.getServers()
        const target = getBestTarget(servers, ns)
        const serializeableServers: string[] = []

        servers.forEach((host) => serializeableServers.push(host))

        harvestQueue.write({ target, servers: serializeableServers })

        await ns.sleep(60000)
    }
}
