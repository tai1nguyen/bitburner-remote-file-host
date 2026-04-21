import { describe, it, expect, vi } from 'vitest'
import { NS } from '@ns'
import Mock from '/mocks'
import { Infector } from '/scripts/services/infector'
import * as getSysCtrl from '/utils/get-sys-ctrl'

vi.mock('/scripts/services/infector', () => Mock.Infector)
vi.mock('/scripts/utils/log-exe-info')

describe('get-sys-ctrl', () => {
    it('should call Executor.run with arguments', () => {
        Mock.Netscript.getServer.mockReturnValue({ hostname: 'test' })
        Mock.Netscript.args = ['test']

        getSysCtrl.main(Mock.Netscript as unknown as NS)

        expect(
            vi.mocked(Infector).mock.results[0].value.infect
        ).toHaveBeenCalledWith({ hostname: 'test' })
    })
})
