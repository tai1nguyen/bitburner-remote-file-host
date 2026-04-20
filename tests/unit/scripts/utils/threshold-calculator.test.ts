import { describe, expect, it } from 'vitest'
import { ThresholdCalculator } from '/scripts/utils/threshold-calculator'
import { Server } from '@ns'

describe('ThresholdCalculator', () => {
    const getServer = (
        currentMoney?: number,
        maxMoney?: number,
        currentSecurity?: number,
        minSecurity?: number
    ): Server => {
        return {
            moneyAvailable: currentMoney,
            moneyMax: maxMoney,
            hackDifficulty: currentSecurity,
            minDifficulty: minSecurity
        } as Server
    }

    it('should return the server', () => {
        expect(new ThresholdCalculator({} as Server).getServer()).toEqual({})
    })

    describe('isAtTargetMoneyThreshold', () => {
        it('should return true when server is at money threshold', () => {
            const server = getServer(10, 10, undefined, undefined)

            expect(new ThresholdCalculator(server).isAtMoneyThreshold()).toBe(
                true
            )
        })

        it('should return false when the server does not have current money defined', () => {
            const server = getServer(undefined, 10, undefined, undefined)

            expect(new ThresholdCalculator(server).isAtMoneyThreshold()).toBe(
                false
            )
        })

        it('should return true when the server does not have max money defined', () => {
            const server = getServer(10, undefined, undefined, undefined)

            expect(new ThresholdCalculator(server).isAtMoneyThreshold()).toBe(
                true
            )
        })
    })

    describe('isAtSecurityThreshold()', () => {
        it('should return true when server is at security threshold', () => {
            const server = getServer(undefined, undefined, 1, 1)

            expect(
                new ThresholdCalculator(server).isAtSecurityThreshold()
            ).toBe(true)
        })

        it('should return true when the server does not have current security defined', () => {
            const server = getServer(undefined, undefined, undefined, 1)

            expect(
                new ThresholdCalculator(server).isAtSecurityThreshold()
            ).toBe(true)
        })

        it('should return false when the server does not max security defined', () => {
            const server = getServer(undefined, undefined, 1, undefined)

            expect(
                new ThresholdCalculator(server).isAtSecurityThreshold()
            ).toBe(false)
        })
    })
})
