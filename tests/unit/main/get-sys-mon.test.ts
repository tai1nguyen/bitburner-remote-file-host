import { beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import * as getSysMon from '/main/get-sys-mon'
import { NS } from '@ns'

describe('get-sys-mon', () => {
    const mockSleep = () => {
        let sleepResolve: (value: unknown) => void
        const sleepPromise = new Promise((resolve) => (sleepResolve = resolve))
        Mock.Netscript.sleep.mockReturnValue(sleepPromise)

        return sleepResolve!
    }

    beforeEach(() => {
        Mock.Netscript.hackAnalyzeChance.mockReturnValue(1)
        Mock.Netscript.getHackTime.mockReturnValue(1000)
        Mock.Netscript.getGrowTime.mockReturnValue(1000)
        Mock.Netscript.getWeakenTime.mockReturnValue(1000)
        Mock.Netscript.formatNumber.mockImplementation((number) => number)
        Mock.Netscript.formatPercent.mockImplementation((number) => number)
        Mock.Netscript.getServer.mockReturnValue({
            hostname: 'foo',
            moneyMax: 100,
            moneyAvailable: 50,
            baseDifficulty: 100,
            hackDifficulty: 50,
            minDifficulty: 10,
            serverGrowth: 50
        })
    })

    it('should monitor the provided host', async () => {
        mockSleep()

        getSysMon.main(Mock.Netscript as unknown as NS)

        await vi.waitFor(() =>
            expect(Mock.Netscript.print).toHaveBeenCalledWith(
                expect.stringContaining('foo')
            )
        )
    })

    it('should indicate that it is running', async () => {
        const header1 = 'INFO [Main]: Monitoring [In Progress...]'
        const header2 = 'INFO [Main]: Monitoring [              ]'
        const resolveOne = mockSleep()
        Mock.Netscript.getServer.mockReturnValue({ hostname: 'foo' })
        getSysMon.main(Mock.Netscript as unknown as NS)

        await vi.waitFor(() =>
            expect(Mock.Netscript.print).toHaveBeenCalledWith(header1)
        )

        mockSleep()
        resolveOne(undefined)

        await vi.waitFor(() =>
            expect(Mock.Netscript.print).toHaveBeenCalledWith(header2)
        )
    })
})
