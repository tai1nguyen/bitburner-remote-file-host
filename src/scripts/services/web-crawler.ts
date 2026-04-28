import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

type TargetPredicate = (host: string) => boolean
type OnTargetFound = (host: string) => boolean

export class WebCrawler {
    private ns: NS
    private logger: Logger
    private listOfServers: Set<string> = new Set([])
    private isValidTarget: TargetPredicate = () => true
    private onTargetFound: OnTargetFound = () => true
    private count?: number

    /**
     * The WebCrawler scans the entire network and will execute
     * the handler when it finds a valid target.
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

    /**
     * Start scanning the network. Will continue scanning
     * the network until it has reached every server.
     */
    public start = async (): Promise<void> => {
        this.logger.info('Crawling the network...')

        const network: Set<string> = new Set(['home'])

        const isAbleToAdd = async (host: string) => {
            const verifyTarget = async (host: string) => {
                await this.ns.sleep(250)
                return this.isValidTarget(host)
            }

            const handleTarget = async (host: string) => {
                await this.ns.sleep(250)
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
                        this.listOfServers.add(neighbor)
                    } else {
                        this.logger.warn(`Skipping server: [${neighbor}].`)
                    }

                    if (this.count && this.listOfServers.size >= this.count) {
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

            this.logger.info(`Finished scanning ${network.size} servers.`)
            this.logger.info('No more servers found on the network.')
        } catch (error) {
            this.logger.warn('Error:', error)
        }
    }

    /**
     * Gets the list of servers that have met the search
     * predicate and have been successfully acted on by
     * the handler.
     *
     * @returns Returns the list of servers meet the
     * search predicate and that have been successfully
     * acted on by the handler.
     */
    public getServers = () => this.listOfServers

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
