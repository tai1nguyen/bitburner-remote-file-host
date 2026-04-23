import { describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { NS } from '@ns'
import { growWeaken } from '/scripts/shared/grow-weaken'
import { main } from '/scripts/grow-target'

vi.mock('/scripts/utils/log-exe-info')
vi.mock('/scripts/shared/grow-weaken')

describe('grow-target', () => {
    it('should grow the target', () => {
        vi.mocked(growWeaken).mockReturnValue(new Promise(() => {}))
        const ns = Mock.Netscript
        ns.args = ['target']

        main(ns as unknown as NS)

        expect(growWeaken).toHaveBeenCalledWith(ns, 'target')
    })
})
