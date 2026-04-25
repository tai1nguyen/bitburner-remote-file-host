import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'
import { Executor } from './executor'
import _ from '/scripts/utils/helpers'

/**
 * This class manages the network of worker nodes used to attack
 * hosts. It handles determining which hosts to use as nodes
 * and what scripts to execute on nodes.
 */
export class NodeManager {
    private ns: NS
    private logger: Logger
    private executor: Executor
    private workerNodes: string[] = []
    private currentTarget?: string = undefined

    constructor(ns: NS) {
        this.executor = new Executor(ns)
        this.logger = new Logger(ns, 'NodeManager')
        this.ns = ns
    }

    public processUpdates = async (target: string, servers: string[]) => {
        const isNewTarget =
            target !== undefined && target !== this.currentTarget
        const newNodes = _.difference(this.getNodes(servers), this.workerNodes)
        const nodeTarget = isNewTarget ? target : this.currentTarget

        this.logger.info('Processing updates...')

        if (isNewTarget) {
            this.logger.info(`Forcing nodes to use target: ${nodeTarget}`)
            this.logger.info(`Old target was ${this.currentTarget}`)
            this.stopNodeProcesses(this.workerNodes)
            await this.startNodeProcesses(this.workerNodes, nodeTarget!)
            this.handleHomeProcesses(nodeTarget!)
        }

        if (newNodes.length > 0 && nodeTarget) {
            this.logger.info('Adding nodes to network...')
            this.logger.info(
                `Harvesting ${nodeTarget} with ${newNodes.length} node(s).`
            )
            await this.startNodeProcesses(newNodes, nodeTarget)
            newNodes.forEach((host) => this.workerNodes.push(host))
        }

        this.currentTarget = nodeTarget
        this.logger.info('Calibration complete.')
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
        this.logger.info('Starting processes...')
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
        this.logger.info('Stopping processes...')

        servers.forEach((host) => {
            this.logger.info(`Killing processes on ${host}.`)
            this.ns.killall(host)
        })
    }

    private getNodes = (servers: string[]) => {
        const nodeSuspects: string[] = []
        const isNode = (host: string) => host.includes('node')
        const hasNodes = (hosts: string[]) => !!hosts.find(isNode)

        this.logger.info('Getting worker nodes...')

        servers.forEach((host) => nodeSuspects.push(host))

        const nodes = hasNodes(nodeSuspects)
            ? nodeSuspects.filter(isNode)
            : nodeSuspects

        return nodes
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
}
