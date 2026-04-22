import { describe, expect, it, vi } from 'vitest'
import { NS } from '@ns'
import Mock from '/mocks'
import { FileCopier } from '/scripts/services/file-copier'

vi.mock('/scripts/utils/logger', () => Mock.Logger)

describe('FileCopier', () => {
    it('should copy all files from /scripts', () => {
        vi.mocked(Mock.Netscript.ls).mockReturnValue([
            '/dir',
            '/dir/file-in-dir.js',
            '/file-in-root.js'
        ])

        new FileCopier(Mock.Netscript as unknown as NS).copyScriptFiles(
            'target'
        )

        expect(Mock.Netscript.scp).toHaveBeenCalledWith(
            ['/dir/file-in-dir.js', '/file-in-root.js'],
            'target'
        )
    })

    it('should not throw when the copy fails', () => {
        vi.mocked(Mock.Netscript.scp).mockThrow(new Error('failed to copy'))
        vi.mocked(Mock.Netscript.ls).mockReturnValue([
            '/dir',
            '/dir/file-in-dir.js',
            '/file-in-root.js'
        ])

        expect(
            new FileCopier(Mock.Netscript as unknown as NS).copyScriptFiles
        ).not.toThrow()
    })

    describe('logToTerminal()', () => {
        it('should toggle logs to go to the terminal', () => {
            new FileCopier(Mock.Netscript as unknown as NS).logToTerminal(true)

            expect(Mock.Logger.toTerminal).toHaveBeenCalledWith(true)
        })
    })
})
