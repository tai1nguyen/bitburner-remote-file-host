import { NS, Server } from '@ns'
import { Infector } from './services/infector'
import { Executor, RunArgs } from './services/executor'

// Attempt to gain access to neigboring servers and then execute weaken or grow on the target server.
// Avoids servers that are already running scripts
export const main = async (ns: NS) => {
    const target = ns.args[0] as string
    const action = ns.args[1] as string
    const count = ns.args[2] as number

    ns.tprint(`[${action}] (x${count} servers) => [${target}]`)

    const serversToInfect: Server[] = []

    if (count === 1) {
        serversToInfect.push(ns.getServer(ns.getHostname()))
    } else {
        serversToInfect.concat(
            ns
                .scan()
                .map((host) => {
                    const server = ns.getServer(host)
                    const isRunningScripts = ns.ps(host).length > 0

                    if (server.hostname === 'home') {
                        ns.print(`skipped ${host}, cannot infect home`)
                        return null
                    }

                    if (isRunningScripts) {
                        ns.print(`skipped ${host}, already running scripts`)
                        return null
                    }

                    return server
                })
                .filter((server) => server !== null)
                .slice(0, count - 1)
        )

        serversToInfect.push(ns.getServer(ns.getHostname()))
    }

    ns.print(
        `Servers to infect: [${serversToInfect.map((server) => server.hostname).join(', ')}]`
    )

    for (const server of serversToInfect) {
        try {
            new Infector(ns).infect(server)
            new Executor(ns).run([server.hostname, target, action] as RunArgs)
        } catch {
            ns.print(`Failed to infect ${server.hostname}`)
        }
    }
}
