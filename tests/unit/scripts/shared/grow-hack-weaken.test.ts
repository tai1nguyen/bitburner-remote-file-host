import { describe, expect, it } from 'vitest'
import Mock from '/mocks'
import { growHackWeaken } from '/scripts/shared/grow-hack-weaken'
import { NS } from '@ns'

describe('growHackWeaken()', () => {
    it('should grow the target when it is below target levels', async () => {
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'target',
            moneyMax: 100,
            moneyAvailable: 20,
            hackDifficulty: 10,
            minDifficulty: 10
        })

        await growHackWeaken(Mock.Netscript as unknown as NS, 'target')

        expect(Mock.Netscript.grow).toHaveBeenCalledWith('target')
    })

    it('should hack the target when it is ready', async () => {
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'target',
            moneyMax: 100,
            moneyAvailable: 100,
            hackDifficulty: 10,
            minDifficulty: 10
        })

        await growHackWeaken(Mock.Netscript as unknown as NS, 'target')

        expect(Mock.Netscript.hack).toHaveBeenCalledWith('target')
    })

    it('should weaken the target when it is above target levels', async () => {
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'target',
            moneyMax: 100,
            moneyAvailable: 20,
            hackDifficulty: 50,
            minDifficulty: 10
        })

        await growHackWeaken(Mock.Netscript as unknown as NS, 'target')

        expect(Mock.Netscript.weaken).toHaveBeenCalledWith('target')
    })
})
