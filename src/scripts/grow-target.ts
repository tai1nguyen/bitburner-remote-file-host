import { NS } from '@ns'
import { logSysInfo } from './utils/log-sys-info'
import { ThresholdCalculator } from './utils/threshold-calculator'

/**
 * This script prepares the target server for harvest by growing
 * its money and weakening its security.
 * 
 * @param ns 
 */
export const main = async (ns: NS) => {
    ns.disableLog('ALL')
    const target = ns.args[0] as string
    const server = ns.getServer(target)
    const thresholder = new ThresholdCalculator(server)

    logSysInfo({ tprint: ns.tprint, server })
    ns.tprint('starting grow/weaken loop...')
    ns.print('starting grow/weaken loop...')

    while (true) {
        if (thresholder.isAtSecurityThreshold()) {
            ns.print(`target [${target}] is at or below security threshold`)
            ns.print(`current security level: ${server.hackDifficulty}`)
            ns.print(`security target level: ${thresholder.getTargetSecurityThreshold()}`)
        } else {
            ns.print('weakening...')
            await ns.weaken(target)
        }

        if (thresholder.isAtMoneyThreshold()) {
            ns.print(`target [${target}] is ready for harvest`)
            ns.print(`current money: ${server.moneyAvailable}`)
            ns.print(`target money: ${thresholder.getTargetMoneyThreshold()}`)
        }

        ns.print('growing...')
        await ns.grow(target)
    }
}