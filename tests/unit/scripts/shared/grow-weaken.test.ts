import { describe, expect, it } from 'vitest'
import Mock from '/mocks'
import { growWeaken } from '/scripts/shared/grow-weaken'
import { NS } from '@ns'

describe('growWeaken()', () => {
    it('should grow the target when it is below target levels', async () => {
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'target',
            moneyMax: 100,
            moneyAvailable: 20,
            hackDifficulty: 10,
            minDifficulty: 10
        })

        await growWeaken(Mock.Netscript as unknown as NS, 'target')

        expect(Mock.Netscript.grow).toHaveBeenCalledWith('target')
    })

    it('should weaken the target', async () => {
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'target',
            moneyMax: 100,
            moneyAvailable: 100,
            hackDifficulty: 50,
            minDifficulty: 10
        })

        await growWeaken(Mock.Netscript as unknown as NS, 'target')

        expect(Mock.Netscript.weaken).toHaveBeenCalledWith('target')
    })
})
