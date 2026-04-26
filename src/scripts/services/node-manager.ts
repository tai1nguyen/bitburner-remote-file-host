import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'
import { Executor } from './executor'
import { NodeProvider } from './node-provider'
import _ from '/scripts/utils/helpers'

export class NodeManager {
    private ns: NS
    private logger: Logger
    private executor: Executor
    private nodeProvider: NodeProvider
    private workerNodes: string[] = []
    private currentTarget?: string = undefined
    private nodePrefix: string = 'node'

    /**
     * This class manages the network of worker nodes used to attack
     * hosts.
     *
     * @param ns
     */
    constructor(ns: NS) {
        this.executor = new Executor(ns)
        this.nodeProvider = new NodeProvider(ns)
        this.logger = new Logger(ns, 'NodeManager')
        this.ns = ns
    }

    /**
     * Handles updates from the Worm program. Will point all nodes to the provided target.
     * Nodes in this context are either network hosts or cloud servers that are used as
     * vectors of attack. If a new target is provided it will kill all running processes
     * on current nodes and spin up new ones pointing to the new target.
     *
     * Additionally, if new nodes are discovered it will handle adding those nodes to its
     * list of worker nodes. If all nodes are cloud servers and there are no new
     * nodes to added, it will attempt to upgrade nodes.
     *
     * @param target
     * @param servers
     * @returns Promise<void>
     */
    public processUpdates = async (target: string, servers: string[]) => {
        this.logger.info('Processing updates...')

        const isNewTarget =
            target !== undefined && target !== this.currentTarget
        const nodes: string[] = this.nodeProvider.getNodes(
            this.workerNodes,
            servers
        )
        const isWorkerNodesAvailable = !!nodes.find((host) =>
            host.includes(this.nodePrefix)
        )
        const isUsingNetworkHosts = !!this.workerNodes.find(
            (host) => !host.includes(this.nodePrefix)
        )

        if (isWorkerNodesAvailable && isUsingNetworkHosts) {
            // Kill existing host nodes and empty the list
            // to prepare for using worker nodes.
            this.stopNodeProcesses(this.workerNodes)
            this.workerNodes = []
        }

        const newNodes = _.difference(nodes, this.workerNodes)
        const nodeTarget = isNewTarget ? target : this.currentTarget

        if (_.isEmpty(newNodes) && !isUsingNetworkHosts) {
            // attempt to upgrade existing nodes.
            const upgradeNodes = this.nodeProvider.upgradeNodes(
                this.workerNodes
            )
            await this.startNodeProcesses(upgradeNodes, nodeTarget!)
        }

        // point all existing nodes to the new target.
        if (isNewTarget) {
            this.logger.info(`Forcing nodes to use target: ${nodeTarget}`)
            this.logger.info(`Old target was ${this.currentTarget}`)
            this.stopNodeProcesses(this.workerNodes)
            await this.startNodeProcesses(this.workerNodes, nodeTarget!)
            this.handleHomeProcesses(nodeTarget!)
        }

        // calibrate new nodes to new target.
        if (newNodes.length > 0 && nodeTarget) {
            this.logger.info('Adding nodes to network...')
            this.logger.info(
                `Harvesting ${nodeTarget} with ${newNodes.length} node(s).`
            )
            await this.startNodeProcesses(newNodes, nodeTarget)
            newNodes.forEach((host) => this.workerNodes.push(host))
        }

        this.currentTarget = nodeTarget
        this.logger.info('Finished processing updates.')
    }

    private handleHomeProcesses = (target: string) => {
        try {
            this.logger.info('Killing harvest process on home.')
            this.ns.scriptKill('scripts/harvest-target.js', 'home')
            this.logger.info('Starting harvest process on home.')
            this.executor.harvestTarget({ host: 'home', target, threads: 400 })
        } catch (error) {
            this.logger.warn(`Failed to handle home processes.`, error)
        }
    }

    private startNodeProcesses = async (nodes: string[], target: string) => {
        this.logger.info('Starting node processes...')
        for (const node of nodes) {
            try {
                this.ns.killall(node)
                this.executor.harvestTarget({ host: node, target })
            } catch (error) {
                this.logger.warn(`Failed to execute harvest.`, error)
            }

            await this.ns.sleep(500)
        }
    }

    private stopNodeProcesses = (servers: string[]) => {
        this.logger.info('Stopping node processes...')

        servers.forEach((host) => {
            this.logger.info(`Killing processes on ${host}.`)
            this.ns.killall(host)
        })
    }
}
