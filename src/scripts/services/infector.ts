import { NS, Server } from '@ns'
import { Accessor } from './accessor'
import { FileCopier } from './file-copier'
import { Logger } from '/scripts/utils/logger'

export class Infector {
    ns: NS
    logger: Logger

    /**
     * This service attempts to gain root access to the target server. Once access
     * is attained it then copies over scripts to prepare the server for
     * further actions.
     *
     * @param ns {NS}
     */
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

            this.logger.info(`Successfully infected ${server.hostname}.`)
        } catch (error) {
            this.logger.error(`Failed to infect ${server.hostname}:`, error)
            throw error
        }
    }
}
