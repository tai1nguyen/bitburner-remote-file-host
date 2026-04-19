import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

export class FileCopier {
    ns: NS
    target: string
    logger: Logger
    baseDirectory: string = 'scripts'

    /**
     * The FileCopier is responsible for copying files to a target server. Currently
     * it only copies the contents of /scripts.
     *
     * @param ns {NS}
     * @param target {string}
     */
    constructor(ns: NS, target: string) {
        this.ns = ns
        this.target = target
        this.logger = Logger.Builder.setLogPrefix('FileCopier')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    public copyScriptFiles = (host: string = 'home') => {
        this.copyFilesInDirectory(this.baseDirectory, host)
    }

    private copyFilesInDirectory = (targetDirectory: string, host: string) => {
        try {
            this.logger.info(
                `Copying files from ${host}:${targetDirectory} to: ${this.target}.`
            )
            const filesToCopy = this.ns
                .ls(host, `${targetDirectory}`)
                .filter((file) => file.endsWith('.js'))

            this.logger.info(`Found ${filesToCopy.length} file(s) to copy.`)
            this.ns.scp(filesToCopy, this.target)
        } catch (error) {
            this.logger.error(
                `Failed to copy files from ${host}:${targetDirectory} to: ${this.target}.`,
                error
            )
        }
    }
}
