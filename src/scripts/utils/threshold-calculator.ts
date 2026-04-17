import { Server } from '@ns'

export class ThresholdCalculator {
    private server: Server

    constructor(server: Server) {
        this.server = server
    }

    getServer = () => this.server

    getTargetMoneyThreshold = () => (this.server.moneyMax || 0) * 0.8

    getTargetSecurityThreshold = () => (this.server.minDifficulty || 0) + 0.5

    isAtMoneyThreshold = () => {
        const targetThreshold = this.getTargetMoneyThreshold()
        return (this.server.moneyAvailable || 0) >= targetThreshold
    }

    isAtSecurityThreshold = () => {
        const targetSecurityThreshold = this.getTargetSecurityThreshold()
        return (this.server.hackDifficulty || 0) <= targetSecurityThreshold
    }
}
