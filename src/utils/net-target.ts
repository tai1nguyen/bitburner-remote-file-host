import { NS } from '@ns'
import { Executor, RunArgs } from '/scripts/services/executor'
import { logExeInfo } from '/scripts/utils/log-exe-info'

/**
 * This script takes a host server, a script and a target server
 * as arguments. It then remotely accesses the host and executes
 * the provided action pointing at the target.
 *
 * @param host {string} - The server to execute the script on.
 * @param target {string} - The server to target with the script.
 * @param action {ExecutorActions} - The action to execute on the host server.
 * @param args {string[]} - Additional arguments to pass to the script.
 */
export const main = (ns: NS) => {
    logExeInfo(ns)
    new Executor(ns).run(ns.args as RunArgs)
}
