import { describe, it, expect } from 'vitest'
import { formatErrorStack } from '/scripts/utils/format-error-stack'

describe('formatErrorStack()', () => {
    it('should format the error string', () => {
        const stack =
            '"RUNTIME ERROR\nutils/net-harvest-remote.js@home (PID - 11)\n\nnuke: Not enough ports opened to use NUKE.exe virus.\n\nStack:\nscripts/services/accessor.js:L53@Accessor.getRootAccess\nscripts/services/infector.js:L28@Infector.infect\nutils/net-harvest-remote.js:L23@infectServer\nutils/net-harvest-remote.js:L-1@unknown\nutils/net-harvest-remote.js:L-1@unknown"'

        const result = formatErrorStack(stack)

        expect(result).toEqual(
            `-----------------------------------\nRUNTIME ERROR\n-----------------------------------\nLocation:\n  utils/net-harvest-remote.js@home (PID - 11)\nMessage:\n  nuke: Not enough ports opened to use NUKE.exe virus.\nStack:\n  at scripts/services/accessor.js:L53@Accessor.getRootAccess\n  at scripts/services/infector.js:L28@Infector.infect\n  at utils/net-harvest-remote.js:L23@infectServer\n  at utils/net-harvest-remote.js:L-1@unknown\n  at utils/net-harvest-remote.js:L-1@unknown`
        )
    })

    it('should format the error stack', () => {
        const stack =
            'Error: Not enough threads available on home to harvest harakiri-sushi.\n    at Executor.harvestTarget (home/scripts/services/executor.js:79:19)\n    at Executor.run (home/scripts/services/executor.js:51:26)\n    at main (home/utils/net-target.js:15:22)\n    at R (file:///D:/games/lib/bitburner/resources/app/dist/main.bundle.js:9:416387)'

        const error = new Error('error')
        error.stack = stack

        const result = formatErrorStack(error)

        expect(result).toEqual(
            '-----------------------------------\nERROR\n-----------------------------------\nMessage:\n  Error: Not enough threads available on home to harvest harakiri-sushi.\nStack:\n  at Executor.harvestTarget (home/scripts/services/executor.js:79:19)\n  at Executor.run (home/scripts/services/executor.js:51:26)\n  at main (home/utils/net-target.js:15:22)\n  at R (file:///D:/games/lib/bitburner/resources/app/dist/main.bundle.js:9:416387)'
        )
    })
})
