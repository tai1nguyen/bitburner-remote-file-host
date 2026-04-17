import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

/**
 * The Accessor is responsible for gaining root access on a target
 * server by using any available port-opening programs.
 *
 * @param ns {NS}
 * @param target {string}
 */
export class Accessor {
    ns: NS
    target: string
    logger: Logger

    constructor(ns: NS, target: string) {
        this.ns = ns
        this.target = target
        this.logger = Logger.Builder.setLogPrefix('Accessor')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    public getRootAccess = () => {
        this.logger.info(`Gaining root access on: ${this.target}.`)

        // Try to open all possible ports via available programs.
        try {
            if (this.ns.fileExists('BruteSSH.exe', 'home')) {
                this.logger.info('Running BruteSSH.exe...')
                this.ns.brutessh(this.target)
            }

            if (this.ns.fileExists('FTPCrack.exe', 'home')) {
                this.logger.info('Running FTPCrack.exe...')
                this.ns.ftpcrack(this.target)
            }

            if (this.ns.fileExists('relaySMTP.exe', 'home')) {
                this.logger.info('Running relaySMTP.exe...')
                this.ns.relaysmtp(this.target)
            }

            if (this.ns.fileExists('HTTPWorm.exe', 'home')) {
                this.logger.info('Running HTTPWorm.exe...')
                this.ns.httpworm(this.target)
            }

            if (this.ns.fileExists('SQLInject.exe', 'home')) {
                this.logger.info('Running SQLInject.exe...')
                this.ns.sqlinject(this.target)
            }
        } catch (error) {
            this.logger.error(`Failed to open ports on: ${this.target}.`, error)
        }

        // Nuke the server to gain root access.
        try {
            this.logger.info('Running NUKE.exe...')
            this.ns.nuke(this.target)
            this.logger.info(`Root access gained on: ${this.target}.`)
        } catch (error) {
            this.logger.error(
                `Failed to get root access on: ${this.target}.`,
                error
            )
        }
    }
}
