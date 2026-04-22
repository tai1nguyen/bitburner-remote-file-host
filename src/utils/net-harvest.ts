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
    const executor = new Executor(ns)
    const logger = new Logger(ns)

    const isValid = (host: string) => ns.getServer(host).hasAdminRights

    const webCrawler = WebCrawler.Builder.setTargetPredicate(isValid)
        .setNetscript(ns)
        .setCount(10)
        .build()

    logger.toTerminal(true)
    webCrawler.logToTerminal(true)

    await webCrawler.hunt()

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

        executor.growHarvestTarget({
            host: 'home',
            target: largestServer,
            threads: 100
        })
    } catch (error) {
        logger.error(`Failed to coordinate grow on ${largestServer}.`, error)
    }
}
