import { NS, Server } from '@ns'
import { Accessor } from './accessor'
import { FileCopier } from './file-copier'

/**
 * Uses the accessor to gain access to the target server
 * then copies all files in the scripts directory over with the file copier..
 * 
 * @param ns {NS}
 */
export class Infector {
    ns: NS
    log: (message: string) => void

    constructor(ns: NS) {
        this.ns = ns
        this.log = (message: string) => {
            this.ns.tprint(`[Infector]: ${message}`)
            this.ns.print(`[Infector]: ${message}`)
        }

        ns.disableLog('ALL')
    }

    public infect = (server: Server) => {
        try {
            const fileCopier = new FileCopier(this.ns, server.hostname)
            const accessor = new Accessor(this.ns, server.hostname)
            this.log(`Infecting ${server.hostname}...`)

            if (!server.hasAdminRights) {
                accessor.getRootAccess()
            }

            fileCopier.copyScriptFiles()

            this.log(`Successfully infected ${server.hostname}`)
        } catch {
            this.log(`Failed to infect ${server.hostname}`)
        }
    }
}
