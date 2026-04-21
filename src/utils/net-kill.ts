import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { WebCrawler } from '/scripts/services/web-crawler'
import { Logger } from '/scripts/utils/logger'

/**
 * This script will kill all running processes on the network.
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const logger = Logger.Builder.setLogFn(ns.print)
        .setTerminalLogFn(ns.tprint)
        .build()

    const webCrawler = new WebCrawler(ns)
    await webCrawler.hunt((host: string) => ns.ps(host).length > 0)
    const serversToKill = webCrawler.getServers()

    logger.info('Killing processes on all servers...')
    for (const host of serversToKill) {
        ns.killall(host)
    }
}
