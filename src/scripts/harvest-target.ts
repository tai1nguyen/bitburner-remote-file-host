import { NS } from '@ns'
import { logSysInfo } from './utils/log-sys-info'
import { ThresholdCalculator } from './utils/threshold-calculator'

export const main = async (ns: NS) => {
    ns.disableLog('ALL')
    const target = ns.args[0] as string
    const server = ns.getServer(target)
    const thresholder = new ThresholdCalculator(server)
    const SIX_SECONDS = 6000

    logSysInfo({ tprint: ns.tprint, server })
    ns.print('starting harvest loop...')

    while (true) {
        if (
            thresholder.isAtMoneyThreshold() &&
            thresholder.isAtSecurityThreshold()
        ) {
            ns.print(`target [${target}] is ready for harvest`)
            ns.print('harvesting...')
            await ns.hack(target)
        } else {
            await ns.sleep(SIX_SECONDS)
        }
    }
}
