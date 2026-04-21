import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Mock from '/mocks'
import { Infector } from '/scripts/services/infector'
import { NS, Server } from '@ns'
import { Accessor } from '/scripts/services/accessor'
import { FileCopier } from '/scripts/services/file-copier'

vi.mock('/scripts/services/accessor', () => Mock.Accessor)
vi.mock('/scripts/services/file-copier', () => Mock.FileCopier)

describe('Infector', () => {
    let infector: Infector

    beforeEach(() => {
        infector = new Infector(Mock.Netscript as unknown as NS)
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('infect()', () => {
        it('should get root access', () => {
            infector.infect({
                hostname: 'target',
                hasAdminRights: false
            } as Server)

            expect(
                vi.mocked(Accessor).mock.results[0].value.getRootAccess
            ).toHaveBeenCalled()
        })

        it('should copy files onto the target', () => {
            infector.infect({
                hostname: 'target',
                hasAdminRights: false
            } as Server)

            expect(
                vi.mocked(FileCopier).mock.results[0].value.copyScriptFiles
            ).toHaveBeenCalledWith('target')
        })

        it('should not get root access if it is already granted', () => {
            infector.infect({
                hostname: 'target',
                hasAdminRights: true
            } as Server)

            expect(
                vi.mocked(Accessor).mock.results[0].value.getRootAccess
            ).not.toHaveBeenCalled()
        })

        it('should throw when an error occurs', () => {
            vi.mocked(Mock.Accessor.getRootAccess).mockThrow(
                new Error('Failed to get access')
            )

            expect(() =>
                infector.infect({ hostname: 'target' } as Server)
            ).toThrow(`Failed to infect target`)
        })
    })
})
