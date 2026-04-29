import { describe, it, expect, vi } from 'vitest'
import Mock from '/mocks'
import * as netTarget from '/main/net-target'
import { NS } from '@ns'

vi.mock('/scripts/services/executor', () => Mock.Executor)
vi.mock('/scripts/utils/log-exe-info')

describe('net-target', () => {
    it('should call Executor.run with arguments', () => {
        const args = ['test']

        netTarget.main({ args } as NS)

        expect(Mock.Executor.run).toHaveBeenCalledWith(args)
    })
})
