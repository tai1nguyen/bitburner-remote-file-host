import { describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { NS } from '@ns'
import { grow } from '/scripts/shared/grow'
import { main } from '/scripts/grow-target'

vi.mock('/scripts/utils/log-exe-info')
vi.mock('/scripts/shared/grow')

describe('grow-target', () => {
    it('should grow the target', () => {
        vi.mocked(grow).mockReturnValue(new Promise(() => {}))
        const ns = Mock.Netscript
        ns.args = ['target']

        main(ns as unknown as NS)

        expect(grow).toHaveBeenCalledWith(ns, 'target')
    })
})
