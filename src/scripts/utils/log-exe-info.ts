import { NS } from '@ns'
import { Logger } from './logger'

export const logExeInfo = (ns: NS, target?: string) => {
    const logger = new Logger(ns)
    logger.toTerminal(true)

    // Disable ns logs as they are too noisy.
    ns.disableLog('ALL')

    logger.info('-----------------------------------')
    logger.info(`Host: ${ns.getHostname()}`)
    logger.info(`Running script: ${ns.getScriptName()}`)
    if (target) logger.info(`Targeting Host: ${target}`)
    logger.info('-----------------------------------')
}
