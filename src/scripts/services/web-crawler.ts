import { NS, Server } from '@ns'
import { Logger } from '/scripts/utils/logger'

type TargetPredicate = (host: string) => boolean
type OnTargetFound = (host: string) => boolean

export class WebCrawler {
    private ns: NS
    private logger: Logger
    private listOfValidServers: Set<string> = new Set([])
    private isValidTarget: TargetPredicate = () => true
    private onTargetFound: OnTargetFound = () => true
    private count?: number

    /**
     * The WebCrawler scans the network and attempts
     * to infect as many servers as possible.
     *
     * @param ns
     */
    constructor(
        ns: NS,
        isValidTarget?: TargetPredicate,
        onTargetFound?: OnTargetFound,
        count?: number
    ) {
        this.ns = ns
        this.logger = new Logger(ns, 'WebCrawler')

        ns.disableLog('ALL')

        if (isValidTarget) this.isValidTarget = isValidTarget
        if (onTargetFound) this.onTargetFound = onTargetFound
        if (count && count > 0) {
            this.count = count
        } else {
            this.logger.warn(
                'No count set for WebCrawler, it will traverse the entire network!'
            )
        }
    }

    public hunt = async (): Promise<void> => {
        this.logger.info('Hunting...')

        const network: Set<string> = new Set(['home'])

        const isAbleToAdd = async (host: string) => {
            const verifyTarget = async (host: string) => {
                await this.ns.sleep(500)
                return this.isValidTarget(host)
            }

            const handleTarget = async (host: string) => {
                await this.ns.sleep(500)
                return this.onTargetFound(host)
            }

            if (host === 'home') {
                return false
            }

            return (await verifyTarget(host)) && (await handleTarget(host))
        }

        try {
            const scanNeighbors = async (host: string) => {
                for (const neighbor of this.ns.scan(host)) {
                    this.logger.info(`Found server: [${neighbor}].`)
                    network.add(neighbor)

                    if (await isAbleToAdd(neighbor)) {
                        this.logger.success(
                            `Adding server [${neighbor}] to list.`
                        )
                        this.listOfValidServers.add(neighbor)
                    } else {
                        this.logger.warn(`Skipping server: [${neighbor}].`)
                    }

                    if (
                        this.count &&
                        this.listOfValidServers.size >= this.count
                    ) {
                        throw new Error(
                            `Server list has reached maximum size: ${this.count}`
                        )
                    }
                }
            }

            for (const host of network) {
                this.logger.info(`Scanning neighbors of [${host}]`)
                await scanNeighbors(host)
            }

            this.logger.info('No more servers found on the network...')
        } catch (error) {
            this.logger.warn('Error:', error)
        }
    }

    public getBestTarget = (): string => {
        const servers: Server[] = []

        this.listOfValidServers.forEach((host) => {
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

    public getServers = () => this.listOfValidServers

    public logToTerminal = (toTerminal: boolean) =>
        this.logger.toTerminal(toTerminal)

    public static get Builder() {
        return new WebCrawler.WebCrawlerBuilder()
    }

    private static WebCrawlerBuilder = class {
        private isValidTarget?: TargetPredicate
        private onTargetFound?: OnTargetFound
        private count?: number
        private ns?: NS

        public setTargetPredicate = (isValid: TargetPredicate) => {
            this.isValidTarget = isValid
            return this
        }

        public setOnTargetFound = (onTarget: OnTargetFound) => {
            this.onTargetFound = onTarget
            return this
        }

        public setCount = (count: number) => {
            this.count = count
            return this
        }

        public setNetscript = (ns: NS) => {
            this.ns = ns
            return this
        }

        public build = () => {
            if (!this.ns) {
                throw new Error('Netscript not provided.')
            }

            return new WebCrawler(
                this.ns,
                this.isValidTarget,
                this.onTargetFound,
                this.count
            )
        }
    }
}
