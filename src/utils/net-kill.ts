import { NS } from '@ns'
import { logExeInfo } from '/scripts/utils/log-exe-info'
import { WebCrawler } from '/scripts/services/web-crawler'
import { Logger } from '/scripts/utils/logger'

/**
 * This script will kill all running processes on the network.
 */
export const main = async (ns: NS) => {
    logExeInfo(ns)
    const logger = new Logger(ns)
    const isTarget = (host: string) => ns.ps(host).length > 0

    const killAllProcesses = (host: string) => {
        logger.info(`Killing processes on ${host}.`)
        ns.killall(host)
        return true
    }

    await WebCrawler.Builder.setTargetPredicate(isTarget)
        .setOnTargetFound(killAllProcesses)
        .setNetscript(ns)
        .build()
        .hunt()
}
