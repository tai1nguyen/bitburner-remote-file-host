import { describe, it, expect } from 'vitest'
import { NS } from '@ns'
import Mock from '/mocks'
import { logExeInfo } from '/scripts/utils/log-exe-info'

describe('logExeInfo()', () => {
    it('should print the host', () => {
        logExeInfo(Mock.Netscript as unknown as NS)

        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            expect.stringContaining(Mock.Netscript.getHostname())
        )
        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            expect.stringContaining(Mock.Netscript.getHostname())
        )
    })

    it('should print the script running', () => {
        logExeInfo(Mock.Netscript as unknown as NS)

        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            expect.stringContaining(Mock.Netscript.getScriptName())
        )
        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            expect.stringContaining(Mock.Netscript.getScriptName())
        )
    })
})
