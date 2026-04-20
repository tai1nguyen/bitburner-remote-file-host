import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

export class FileCopier {
    private ns: NS
    private host: string
    private logger: Logger
    private baseDirectory: string = 'scripts'

    /**
     * The FileCopier is responsible for copying files from the host server to a target server. Currently
     * it only copies the contents of /scripts.
     *
     * @param ns {NS}
     * @param target {string}
     */
    constructor(ns: NS, host?: string) {
        this.ns = ns
        this.host = host || 'home'
        this.logger = Logger.Builder.setLogPrefix('FileCopier')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    public copyScriptFiles = (target: string) => {
        this.copyFilesInDirectory(this.baseDirectory, target)
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
