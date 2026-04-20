import { Server } from '@ns'

export class ThresholdCalculator {
    private server: Server

    constructor(server: Server) {
        this.server = server
    }

    public getServer = () => this.server

    public isAtMoneyThreshold = () => {
        const targetThreshold = this.getTargetMoneyThreshold()
        return (this.server.moneyAvailable || 0) >= targetThreshold
    }

    public isAtSecurityThreshold = () => {
        const targetSecurityThreshold = this.getTargetSecurityThreshold()
        return (this.server.hackDifficulty || 0) <= targetSecurityThreshold
    }

    private getTargetMoneyThreshold = () => (this.server.moneyMax || 0) * 0.8

    private getTargetSecurityThreshold = () =>
        (this.server.minDifficulty || 0) + 0.5
}
