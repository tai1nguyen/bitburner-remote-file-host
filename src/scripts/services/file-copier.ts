import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

export class FileCopier {
    private ns: NS
    private host: string
    private logger: Logger
    private baseDirectory: string = 'scripts'

    /**
     * The FileCopier is responsible for copying files from the home
     * server to a target server. Currently it only copies the
     * contents of /scripts/.
     *
     * @param ns
     */
    constructor(ns: NS) {
        this.ns = ns
        this.host = 'home'
        this.logger = new Logger(ns, 'FileCopier')

        ns.disableLog('ALL')
    }

    /**
     * Copy the contents of the /script directory on the home server to the target server.
     *
     * @param target
     */
    public copyScriptFiles = (target: string) => {
        this.copyFilesInDirectory(this.baseDirectory, target)
    }

    public logToTerminal = (toTerminal: boolean) => {
        this.logger.toTerminal(toTerminal)
    }

    private copyFilesInDirectory = (
        targetDirectory: string,
        target: string
    ) => {
        try {
            this.logger.info(
                `Copying files from ${this.host}:/${targetDirectory} to: ${target}.`
            )
            const filesToCopy = this.ns
                .ls(this.host, `${targetDirectory}`)
                .filter((file) => file.endsWith('.js'))

            this.logger.info(`Found ${filesToCopy.length} file(s) to copy.`)
            this.ns.scp(filesToCopy, target)
        } catch (error) {
            this.logger.error(
                `Failed to copy files from ${this.host}:${targetDirectory} to: ${target}.`,
                error
            )
        }
    }
}
