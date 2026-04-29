import { NS } from '@ns'
import { Infector } from '/scripts/services/infector'
import { logExeInfo } from '/scripts/utils/log-exe-info'

/**
 * This script attempts to gain root access on the target server by using any
 * available port-opening programs. Once root access is gained, it copies all
 * scripts from the home server to the target server.
 */
export const main = (ns: NS) => {
    const target = ns.args[0] as string
    const targetServer = ns.getServer(target)

    logExeInfo(ns)
    new Infector(ns).infect(targetServer)
}
