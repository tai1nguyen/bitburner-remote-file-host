import { NS } from '@ns'

/**
 * The FileCopier is responsible for copying files to a target server.
 *
 * @param ns {NS}
 * @param target {string}
 */
export class FileCopier {
    ns: NS
    target: string
    log: (message: string) => void
    baseDirectory: string = 'scripts'

    constructor(ns: NS, target: string) {
        this.ns = ns
        this.target = target
        this.log = (message: string) => {
            this.ns.tprint(`[FileCopier]: ${message}`)
            this.ns.print(`[FileCopier]: ${message}`)
        }

        ns.disableLog('ALL')
    }

    public copyScriptFiles = (host: string = 'home') => {
        this.copyFilesInDirectory(this.baseDirectory, host)
    }

    private copyFilesInDirectory = (targetDirectory: string, host: string) => {
        try {
            this.log(
                `Copying files from [${host}:${targetDirectory}] to: ${this.target}`
            )
            const filesToCopy = this.ns
                .ls(host, `${targetDirectory}`)
                .filter((file) => file.endsWith('.js'))

            this.log(`Found ${filesToCopy.length} file(s) to copy`)
            this.ns.scp(filesToCopy, this.target)
        } catch {
            this.log(
                `Failed to copy files from [${host}:${targetDirectory}] to: ${this.target}`
            )
        }
    }
}
