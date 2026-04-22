import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { Logger } from '/scripts/utils/logger'
import { WebCrawler } from '/scripts/services/web-crawler'
import { Accessor } from '/scripts/services/accessor'
import { FileCopier } from '/scripts/services/file-copier'

/**
 * This script will periodically crawl the network and attempt to infect new machines.
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const logger = new Logger(ns)
    const accessor = new Accessor(ns)
    const fileCopier = new FileCopier(ns)

    // determine if the host on the network is a new server we havent seen before.
    const isTarget = (host: string): boolean => {
        return !ns.hasRootAccess(host)
    }

    const infectTarget = (host: string): boolean => {
        try {
            logger.info(`Attempting to infect ${host}`)
            accessor.getRootAccess(host)
            fileCopier.copyScriptFiles(host)

            return true
        } catch (error) {
            logger.error(`Failed to infect ${host}.`, error)

            return false
        }
    }

    while (true) {
        logger.info('Crawling the network...')
        const crawler = WebCrawler.Builder.setNetscript(ns)
            .setTargetPredicate(isTarget)
            .setOnTargetFound(infectTarget)
            .build()

        await crawler.hunt()
        await ns.sleep(60000)
    }
}
