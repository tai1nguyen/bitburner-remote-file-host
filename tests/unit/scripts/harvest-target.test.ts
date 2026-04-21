import { describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { NS } from '@ns'
import { harvest } from '/scripts/shared/harvest'
import { main } from '/scripts/harvest-target'

vi.mock('/scripts/utils/log-exe-info')
vi.mock('/scripts/shared/harvest')

describe('harvest-target', () => {
    it('should harvest the target', () => {
        vi.mocked(harvest).mockReturnValue(new Promise(() => {}))
        const ns = Mock.Netscript
        ns.args = ['target']

        main(ns as unknown as NS)

        expect(harvest).toHaveBeenCalledWith(ns, 'target')
    })
})
