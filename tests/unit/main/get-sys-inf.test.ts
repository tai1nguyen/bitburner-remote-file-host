import { beforeEach, describe, expect, it } from 'vitest'
import Mock from '/mocks'
import * as getSysInf from '/main/get-sys-inf'
import { NS } from '@ns'

describe('get-sys-inf', () => {
    beforeEach(() => {
        Mock.Netscript.getServer.mockReturnValue({})
    })

    it('should print server information', () => {
        getSysInf.main(Mock.Netscript as unknown as NS)

        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            'WARN [Main]: Server Infomation'
        )
        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            'WARN [Main]: Security Infomation'
        )
        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            'WARN [Main]: Money Infomation'
        )
        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            'WARN [Main]: Hardware Infomation'
        )
        expect(Mock.Netscript.print).toHaveBeenCalledWith(
            'WARN [Main]: Hacking Infomation'
        )
    })

    it('should print to terminal server information', () => {
        getSysInf.main(Mock.Netscript as unknown as NS)

        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            'WARN [Main]: Server Infomation'
        )
        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            'WARN [Main]: Security Infomation'
        )
        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            'WARN [Main]: Money Infomation'
        )
        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            'WARN [Main]: Hardware Infomation'
        )
        expect(Mock.Netscript.tprint).toHaveBeenCalledWith(
            'WARN [Main]: Hacking Infomation'
        )
    })
})
