import { describe, it, expect, vi } from 'vitest'
import Mock from '/mocks'
import { Executor } from '/scripts/services/executor'
import * as netTarget from '/utils/net-target'
import { NS } from '@ns'

vi.mock('/scripts/services/executor', () => Mock.Executor)
vi.mock('/scripts/utils/log-exe-info')

describe('net-target', () => {
    it('should call Executor.run with arguments', () => {
        const args = ['test']

        netTarget.main({ args } as NS)

        expect(
            vi.mocked(Executor).mock.results[0].value.run
        ).toHaveBeenCalledWith(args)
    })
})
