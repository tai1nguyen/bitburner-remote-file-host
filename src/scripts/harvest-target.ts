import { NS } from '@ns'
import { logExeInfo } from './utils/log-exe-info'
import { Logger } from './utils/logger'
import { harvest } from './shared/harvest'

export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const logger = Logger.Builder.setLogFn(ns.print).build()

    logExeInfo(ns)

    logger.info('Starting harvest loop...')

    while (true) {
        ns.clearLog()
        await harvest(ns, target)
    }
}
