import { NS } from '@ns'
import { Logger } from './logger'

export const logExeInfo = (ns: NS, target?: string) => {
    const logger = Logger.Builder.setLogFn(ns.print)
        .setTerminalLogFn(ns.tprint)
        .build()

    // Disable ns logs as they are too noisy.
    ns.disableLog('ALL')

    logger.info('-----------------------------------')
    logger.info(`Host: ${ns.getHostname()}`)
    logger.info(`Running script: ${ns.getScriptName()}`)
    if (target) logger.info(`Targeting Host: ${target}`)
    logger.info('-----------------------------------')
    logger.info('')
}
