import { NS, Server } from '@ns'
import { Logger } from '/scripts/utils/logger'
import { Infector } from '/scripts/services/infector'

export class WebCrawler {
    private ns: NS
    private logger: Logger
    private listOfServers: Set<string> = new Set(['home'])

    /**
     * The WebCrawler scans the network and attempts
     * to infect as many servers as possible.
     *
     * @param ns
     */
    constructor(ns: NS) {
        this.ns = ns
        this.logger = Logger.Builder.setLogPrefix('WebCrawler')
            .setLogFn(ns.print)
            .setTerminalLogFn(ns.tprint)
            .build()

        ns.disableLog('ALL')
    }

    public hunt = async (
        isValid: (host: string) => boolean = () => true,
        serversToInfect?: number
    ): Promise<void> => {
        this.logger.info('Hunting...')

        try {
            const infectServer = async (host: string): Promise<boolean> => {
                try {
                    this.logger.info('Attempting to infect the host...')

                    await this.ns.sleep(1000)
                    const server: Server = this.ns.getServer(host)
                    new Infector(this.ns).infect(server)

                    return true
                } catch (error) {
                    this.logger.warn(`Failed to infect host: ${host}`, error)
                    return false
                }
            }

            const scanNeighbors = async (host: string) => {
                for (const neighbor of this.ns.scan(host)) {
                    this.logger.info(`Found server: [${neighbor}].`)

                    if (
                        neighbor !== 'home' &&
                        isValid(neighbor) &&
                        (await infectServer(neighbor))
                    ) {
                        this.logger.success(
                            `Server [${neighbor}] successfully infected.`
                        )
                        this.listOfServers.add(neighbor)
                    } else {
                        this.logger.warn(`Skipping server: [${neighbor}].`)
                    }

                    if (
                        serversToInfect &&
                        this.listOfServers.size >= serversToInfect + 1
                    ) {
                        throw new Error(
                            `Server list has reached maximum size: ${serversToInfect}`
                        )
                    }
                }
            }

            for (const host of this.listOfServers) {
                this.logger.info(`Scanning neighbors of [${host}]`)
                await scanNeighbors(host)
            }

            this.logger.warn('No more servers found on the network...')
        } catch (error) {
            this.logger.warn('Error:', error)
        }

        this.listOfServers.delete('home')
    }

    public getBestTarget = (): string => {
        const servers: Server[] = []

        this.listOfServers.forEach((host) => {
            servers.push(this.ns.getServer(host))
        })

        this.logger.info('Determining the host with the most money...')

        const largestServer = servers.reduce((prev, curr) => {
            const prevServerMoney = prev.moneyAvailable || 0
            const prevServerMaxMoney = prev.moneyMax || 0
            const currServerMoney = curr.moneyAvailable || 0
            const currServerMaxMoney = curr.moneyMax || 0

            const prevHasMoreTotalMoney =
                prevServerMoney >= currServerMoney ||
                prevServerMaxMoney >= currServerMaxMoney

            return prevHasMoreTotalMoney ? prev : curr
        })

        this.logger.success(`Host: [${largestServer.hostname}]`)
        this.logger.success(`Current money: ${largestServer.moneyAvailable}`)
        this.logger.success(`Max money: ${largestServer.moneyMax}`)

        return largestServer.hostname
    }

    public getServers = () => this.listOfServers
}
