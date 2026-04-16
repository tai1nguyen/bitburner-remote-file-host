import { NS } from '@ns'

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
    log: (message: string) => void

    constructor(ns: NS, target: string) {
        this.ns = ns
        this.target = target
        this.log = (message: string) => {
            this.ns.tprint(`[Accessor]: ${message}`)
            this.ns.print(`[Accessor]: ${message}`)
        }

        ns.disableLog('ALL')
    }

    public getRootAccess = () => {
        this.log(`Gaining root access on: ${this.target}`)

        // Try to open all possible ports via available programs.
        try {
            if (this.ns.fileExists('BruteSSH.exe', 'home')) {
                this.log('Running BruteSSH.exe...')
                this.ns.brutessh(this.target)
            }

            if (this.ns.fileExists('FTPCrack.exe', 'home')) {
                this.log('Running FTPCrack.exe...')
                this.ns.ftpcrack(this.target)
            }

            if (this.ns.fileExists('relaySMTP.exe', 'home')) {
                this.log('Running relaySMTP.exe...')
                this.ns.relaysmtp(this.target)
            }

            if (this.ns.fileExists('HTTPWorm.exe', 'home')) {
                this.log('Running HTTPWorm.exe...')
                this.ns.httpworm(this.target)
            }

            if (this.ns.fileExists('SQLInject.exe', 'home')) {
                this.log('Running SQLInject.exe...')
                this.ns.sqlinject(this.target)
            }
        } catch {
            this.log(`Failed to open ports on: ${this.target}`)
        }

        // Nuke the server to gain root access.
        try {
            this.log('Running NUKE.exe...')
            this.ns.nuke(this.target)
            this.log(`Root access gained on: ${this.target}`)
        } catch {
            this.log(`Failed to get root access on: ${this.target}`)
        }
    }
}