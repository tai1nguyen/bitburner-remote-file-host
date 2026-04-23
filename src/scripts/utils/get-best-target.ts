import { NS, Server } from '@ns'

/**
 * Calculates the most profitable host from a list of servers.
 */
export const getBestTarget = (listOfServers: Set<string>, ns: NS): string => {
    const servers: Server[] = []

    listOfServers.forEach((host) => {
        servers.push(ns.getServer(host))
    })

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

    return largestServer.hostname
}
