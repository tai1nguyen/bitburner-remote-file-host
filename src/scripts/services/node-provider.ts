import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'
import _ from '/scripts/utils/helpers'

export class NodeProvider {
    private ns: NS
    private logger: Logger
    private ramMultiplier: number = 3 // 8gb
    private nodeNamePrefix: string = 'node'

    /**
     * The Node Provider attempts to determine which network hosts
     * are valid nodes and, if possible, how many cloud servers
     * to purchase as nodes. Additionally, it also handles when
     * to upgrade cloud server nodes.
     *
     * @param ns
     */
    constructor(ns: NS) {
        this.ns = ns
        this.logger = new Logger(ns, 'NodeProvider')
    }

    /**
     * Takes an array of nodes and will attempt to upgrade them all to the same ram
     * level. If all nodes are on the same ram level it will attempt to upgrade all
     * nodes to the next greatest ram level that is affordable.
     * 
     * @param currentNodes
     * @returns Returns an array of nodes that have been updated.
     */
    public upgradeNodes = (currentNodes: string[]): string[] => {
        if (_.isEmpty(currentNodes) || !this.isUsingWorkerNodes(currentNodes)) {
            this.logger.warn('No nodes to upgrade')
            return []
        }

        const upgradedNodes: string[] = []
        const maxPurchasableRam = this.getMaxPurchasableRam()
        const greatestRamValue = this.getGreatestRamValue(currentNodes)
        const isAllOnSameRam = currentNodes.every(
            (node) => this.ns.getServer(node).maxRam === greatestRamValue
        )
        const targetNodeRam = isAllOnSameRam
            ? maxPurchasableRam
            : greatestRamValue

        if (!targetNodeRam) {
            this.logger.info('Not able to purchase any ram upgrades.')
            return []
        }

        const executePlan = (plan: (host: string) => string) => {
            for (const node of currentNodes) {
                try {
                    const server = this.ns.getServer(node)

                    if (server.maxRam < targetNodeRam) {
                        const nodeToAdd = plan(node)
                        upgradedNodes.push(nodeToAdd)
                    }
                } catch (error) {
                    this.logger.warn(`Exiting upgrade plan.`, error)
                    break
                }
            }
        }

        executePlan((node) => {
            const isOk = this.ns.upgradePurchasedServer(node, targetNodeRam)

            if (isOk) {
                return node
            }

            throw new Error(`Failed to upgrade ${node}.`)
        })

        return upgradedNodes
    }

    /**
     * Gets worker nodes. If nodes (cloud servers) are purchasable, it will
     * return a list of nodes that has been bought. Otherwise, return a
     * list of network hosts that are able to run the harvest script.
     *
     * @param currentNodes
     * @param servers
     * @returns Returns an array of worker nodes or network hosts.
     */
    public getNodes = (currentNodes: string[], servers: string[]): string[] => {
        const isAbleToBuyNodes = this.getMaxPurchasableRam() > 0
        const isUsingWorkerNodes = this.isUsingWorkerNodes(currentNodes)

        if (isAbleToBuyNodes || isUsingWorkerNodes) {
            const existingNodes = servers
                .concat(currentNodes)
                .filter((host) => host.includes(this.nodeNamePrefix))

            const listOfUniqueNodes = Array.from(new Set(existingNodes))

            return this.getWorkerNodes(listOfUniqueNodes)
        } else {
            return this.getNetworkNodes(servers)
        }
    }

    private getWorkerNodes = (currentNodes: string[]) => {
        this.logger.info('Getting worker nodes...')
        const serverLimit = this.ns.getPurchasedServerLimit()

        if (currentNodes.length === serverLimit) {
            return currentNodes
        }

        const listOfNodes: string[] = []
        const maxPurchasableRam = this.getMaxPurchasableRam()
        const greatestRamValue = this.getGreatestRamValue(currentNodes)
        const isUsingNetworkHosts = !!currentNodes.find(
            (host) => !host.includes(this.nodeNamePrefix)
        )

        // If we have no current nodes then use max purchasable ram
        const nodeTargetRam =
            isUsingNetworkHosts || _.isEmpty(currentNodes)
                ? maxPurchasableRam
                : greatestRamValue

        while (listOfNodes.length < serverLimit) {
            const node = this.ns.purchaseServer(
                `${this.nodeNamePrefix}-worker`,
                nodeTargetRam
            )
            const isOk = !!node

            if (isOk) {
                listOfNodes.push(node)
            } else {
                break
            }
        }

        return listOfNodes.concat(currentNodes)
    }

    private getNetworkNodes = (nodeSuspects: string[]) => {
        this.logger.info('Getting worker nodes from network hosts...')

        return nodeSuspects
            .map((host) => {
                const server = this.ns.getServer(host)
                const ramCost = this.ns.getScriptRam(
                    '/scripts/harvest-target.js'
                )

                if (ramCost <= server.maxRam) {
                    return host
                }

                return null
            })
            .filter((host) => host !== null)
    }

    private getGreatestRamValue = (nodes: string[]) => {
        try {
            const nodeWithMostRam = nodes
                .map((host) => this.ns.getServer(host))
                .reduce((prev, curr) =>
                    prev.maxRam > curr.maxRam ? prev : curr
                )

            return nodeWithMostRam.maxRam
        } catch (error) {
            this.logger.error('Failed to get max ram of nodes.', error)
            return 0
        }
    }

    private getMaxPurchasableRam = () => {
        const availableMoney = this.ns.getPlayer().money
        let ramMultiplier = this.ramMultiplier
        let newMultiplier = 0
        let purchasableRam = 0

        while (true) {
            const ram = 2 ** ramMultiplier
            const serverCost = this.ns.getPurchasedServerCost(ram)

            if (availableMoney >= serverCost) {
                newMultiplier = ramMultiplier
                purchasableRam = ram
            } else {
                break
            }

            ramMultiplier++
        }

        // Update ram multiplier to shortcut future iterations.
        if (newMultiplier) this.ramMultiplier = newMultiplier

        return purchasableRam
    }

    private isUsingWorkerNodes = (nodes: string[]) =>
        !!nodes.find((host) => host.includes(this.nodeNamePrefix))
}
