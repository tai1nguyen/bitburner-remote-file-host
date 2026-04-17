import { NS, Server } from '@ns'
import { Accessor } from './accessor'
import { FileCopier } from './file-copier'
import { Logger } from '/scripts/utils/logger'

/**
 * Uses the accessor to gain access to the target server
 * then copies all files in the scripts directory over with the file copier..
 *
 * @param ns {NS}
 */
export class Infector {
    ns: NS
    logger: Logger

    constructor(ns: NS) {
        this.ns = ns
        this.logger = Logger.Builder.setLogPrefix('Infector')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    public infect = (server: Server) => {
        try {
            const fileCopier = new FileCopier(this.ns, server.hostname)
            const accessor = new Accessor(this.ns, server.hostname)
            this.logger.info(`Infecting ${server.hostname}...`)

            if (!server.hasAdminRights) {
                accessor.getRootAccess()
            }

            fileCopier.copyScriptFiles()

            this.logger.info(`Successfully infected ${server.hostname}`)
        } catch (error) {
            this.logger.error(`Failed to infect ${server.hostname}`, error)
        }
    }
}
