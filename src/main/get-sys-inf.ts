import { NS } from '@ns'
import { Logger } from '/scripts/utils/logger'

/**
 * This script retrieves and prints various information about the target server.
 */
export const main = (ns: NS) => {
    const target = ns.args[0] as string
    const server = ns.getServer(target)
    const logger = new Logger(ns)
    logger.toTerminal(true)

    logger.warn('-----------------------------------')
    logger.warn('Server Infomation')
    logger.warn('-----------------------------------')
    logger.warn(`Host Name: ${server.hostname}`)
    logger.warn(`IP: ${server.ip}`)
    logger.warn(`Owned By: ${server.organizationName}`)
    logger.warn('')
    logger.warn('-----------------------------------')
    logger.warn('Security Infomation')
    logger.warn('-----------------------------------')
    logger.warn(`Required Hacking Level: ${server.requiredHackingSkill}`)
    logger.warn(`Min Security level: ${server.minDifficulty}`)
    logger.warn(`Current security: ${server.hackDifficulty}`)
    logger.warn('')
    logger.warn('-----------------------------------')
    logger.warn('Money Infomation')
    logger.warn('-----------------------------------')
    logger.warn(`Max Money: ${server.moneyMax}`)
    logger.warn(`Current Money: ${server.moneyAvailable}`)
    logger.warn(`Server Growth: ${server.serverGrowth}`)
    logger.warn('')
    logger.warn('-----------------------------------')
    logger.warn('Hardware Infomation')
    logger.warn('-----------------------------------')
    logger.warn(`Cores: ${server.cpuCores}`)
    logger.warn(`Max RAM: ${server.maxRam}`)
    logger.warn(`Used RAM: ${server.ramUsed}`)
    logger.warn('')
    logger.warn('-----------------------------------')
    logger.warn('Hacking Infomation')
    logger.warn('-----------------------------------')
    logger.warn(`Rooted: ${server.hasAdminRights}`)
    logger.warn(`Backdoored: ${server.backdoorInstalled}`)
    logger.warn(`Required Open Ports: ${server.numOpenPortsRequired}`)
    logger.warn(`Ports Currently Open: ${server.openPortCount}`)
    logger.warn('')
    logger.warn('-----------------------------------')
}
