import { describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { NS } from '@ns'
import { growHackWeaken } from '/scripts/shared/grow-hack-weaken'
import { main } from '/scripts/harvest-target'

vi.mock('/scripts/utils/log-exe-info')
vi.mock('/scripts/shared/grow-hack-weaken')

describe('harvest-target', () => {
    it('should harvest the target', () => {
        vi.mocked(growHackWeaken).mockReturnValue(new Promise(() => {}))
        const ns = Mock.Netscript
        ns.args = ['target']

        main(ns as unknown as NS)

        expect(growHackWeaken).toHaveBeenCalledWith(ns, 'target')
    })
})
