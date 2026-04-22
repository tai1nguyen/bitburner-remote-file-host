import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

export class Accessor {
    private ns: NS
    private logger: Logger

    /**
     * The Accessor is responsible for gaining root access on a target
     * server by using any available port-opening programs.
     *
     * @param ns {NS}
     * @param target {string}
     */
    constructor(ns: NS) {
        this.ns = ns
        this.logger = new Logger(ns, 'Accessor')

        ns.disableLog('ALL')
    }

    public getRootAccess = (target: string) => {
        this.logger.info(`Gaining root access on: ${target}.`)

        // Try to open all possible ports via available programs.
        try {
            if (this.ns.fileExists('BruteSSH.exe', 'home')) {
                this.logger.info('Running BruteSSH.exe...')
                this.ns.brutessh(target)
            }

            if (this.ns.fileExists('FTPCrack.exe', 'home')) {
                this.logger.info('Running FTPCrack.exe...')
                this.ns.ftpcrack(target)
            }

            if (this.ns.fileExists('relaySMTP.exe', 'home')) {
                this.logger.info('Running relaySMTP.exe...')
                this.ns.relaysmtp(target)
            }

            if (this.ns.fileExists('HTTPWorm.exe', 'home')) {
                this.logger.info('Running HTTPWorm.exe...')
                this.ns.httpworm(target)
            }

            if (this.ns.fileExists('SQLInject.exe', 'home')) {
                this.logger.info('Running SQLInject.exe...')
                this.ns.sqlinject(target)
            }
        } catch (error) {
            this.logger.error(`Failed to open ports on: ${target}.`, error)
        }

        // Nuke the server to gain root access.
        try {
            this.logger.info('Running NUKE.exe...')
            this.ns.nuke(target)
            this.logger.info(`Root access gained on: ${target}.`)
        } catch (error) {
            this.logger.error(`Failed to get root access on: ${target}.`)

            throw new Error(`Failed to get root access on: ${target}.`, {
                cause: error
            })
        }
    }

    public logToTerminal = (toTerminal: boolean) => {
        this.logger.toTerminal(toTerminal)
    }
}
