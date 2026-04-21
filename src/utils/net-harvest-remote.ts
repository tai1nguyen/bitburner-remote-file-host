import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { Logger } from '/scripts/utils/logger'
import { Executor } from '/scripts/services/executor'
import { WebCrawler } from '/scripts/services/web-crawler'

/**
 * This script will prowl the network and attempt to gain control of X servers.
 * It will then pick the host with the most money as the target for hacking.
 * All other servers will attempt to grow and weaken the target host.
 *
 * NOTE: this script is useful for quickly gaining hacking experience
 * when home computer RAM is low.
 *
 * @param ns
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const webCrawler = new WebCrawler(ns)
    const executor = new Executor(ns)
    const logger = Logger.Builder.setLogFn(ns.print)
        .setTerminalLogFn(ns.tprint)
        .build()

    await webCrawler.hunt(undefined, 10)

    const largestServer: string = webCrawler.getBestTarget()
    const servers: Set<string> = webCrawler.getServers()

    // Tell all servers to grow the target.
    logger.info(`Directing all servers to grow/weaken ${largestServer}...`)

    try {
        for (const host of servers) {
            executor.growTarget({ host, target: largestServer })
            await ns.sleep(1000)
        }

        logger.info('Entering harvest loop...')

        executor.harvestTarget({ host: 'home', target: largestServer })
    } catch (error) {
        logger.error(`Failed to coordinate grow on ${largestServer}.`, error)
    }
}
