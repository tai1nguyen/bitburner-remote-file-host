import { NS, Server } from '@ns'
import { Accessor } from './accessor'
import { FileCopier } from './file-copier'
import { Logger } from '/scripts/utils/logger'

export class Infector {
    ns: NS
    logger: Logger
    accessor: Accessor
    fileCopier: FileCopier

    /**
     * This service attempts to gain root access to the target server. Once access
     * is attained it then copies over scripts to prepare the server for
     * further actions.
     *
     * @param ns
     */
    constructor(ns: NS) {
        this.ns = ns
        this.fileCopier = new FileCopier(this.ns)
        this.accessor = new Accessor(this.ns)
        this.logger = new Logger(ns, 'Infector')

        ns.disableLog('ALL')
    }

    /**
     * Attempts to gain root access. If successful, it will then copy
     * scripts from the home server to the infected host.
     *
     * @param server
     */
    public infect = (server: Server) => {
        try {
            this.logger.info(`Infecting ${server.hostname}...`)

            if (!server.hasAdminRights) {
                this.accessor.getRootAccess(server.hostname)
            }

            this.fileCopier.copyScriptFiles(server.hostname)

            this.logger.info(`Successfully infected ${server.hostname}.`)
        } catch (error) {
            this.logger.error(`Failed to infect ${server.hostname}`)
            throw new Error(`Failed to infect ${server.hostname}`, {
                cause: error
            })
        }
    }

    public logToTerminal = (toTerminal: boolean) => {
        this.accessor.logToTerminal(toTerminal)
        this.fileCopier.logToTerminal(toTerminal)
        this.logger.toTerminal(toTerminal)
    }
}
