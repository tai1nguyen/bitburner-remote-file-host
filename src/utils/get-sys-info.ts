import { NS } from '@ns'

/**
 * This script retrieves and prints various information about the target server.
 * 
 * @param target {string} - The server to get information about. This
 *  is expected to be passed as the first argument
 *  when executing the script. 
 */
export const main = (ns: NS) => {
    const target = ns.args[0] as string
    const server = ns.getServer(target)

    ns.tprint('------------------------------------')
    ns.tprint('Server Infomation')
    ns.tprint('------------------------------------')
    ns.tprint(`Host Name: ${server.hostname}`)
    ns.tprint(`IP: ${server.ip}`)
    ns.tprint(`Owned By: ${server.organizationName}`)
    ns.tprint('')
    ns.tprint('------------------------------------')
    ns.tprint('Security Infomation')
    ns.tprint('------------------------------------')
    ns.tprint(`Required Hacking Level: ${server.requiredHackingSkill}`)
    ns.tprint(`Min Security level: ${server.minDifficulty}`)
    ns.tprint(`Current security: ${server.hackDifficulty}`)
    ns.tprint('')
    ns.tprint('------------------------------------')
    ns.tprint('Money Infomation')
    ns.tprint('------------------------------------')
    ns.tprint(`Max Money: ${server.moneyMax}`)
    ns.tprint(`Current Money: ${server.moneyAvailable}`)
    ns.tprint(`Server Growth: ${server.serverGrowth}`)
    ns.tprint('')
    ns.tprint('------------------------------------')
    ns.tprint('Hardware Infomation')
    ns.tprint('------------------------------------')
    ns.tprint(`Cores: ${server.cpuCores}`)
    ns.tprint(`Max RAM: ${server.maxRam}`)
    ns.tprint(`Used RAM: ${server.ramUsed}`)
    ns.tprint('')
    ns.tprint('------------------------------------')
    ns.tprint('Hacking Infomation')
    ns.tprint('------------------------------------')
    ns.tprint(`Rooted: ${server.hasAdminRights}`)
    ns.tprint(`Backdoored: ${server.backdoorInstalled}`)
    ns.tprint(`Required Open Ports: ${server.numOpenPortsRequired}`)
    ns.tprint(`Ports Currently Open: ${server.openPortCount}`)
    ns.tprint('------------------------------------')
    ns.tprint('')
}
