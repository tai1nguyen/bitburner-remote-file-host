import { describe, it, expect, vi } from 'vitest'
import { NS } from '@ns'
import Mock from '/mocks'
import { Infector } from '/scripts/services/infector'
import * as getSysCtl from '/main/get-sys-ctl'

vi.mock('/scripts/services/infector', () => Mock.Infector)
vi.mock('/scripts/utils/log-exe-info')

describe('get-sys-ctl', () => {
    it('should call Executor.run with arguments', () => {
        Mock.Netscript.getServer.mockReturnValue({ hostname: 'test' })
        Mock.Netscript.args = ['test']

        getSysCtl.main(Mock.Netscript as unknown as NS)

        expect(
            vi.mocked(Infector).mock.results[0].value.infect
        ).toHaveBeenCalledWith({ hostname: 'test' })
    })
})
