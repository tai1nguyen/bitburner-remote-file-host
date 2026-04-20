import { vi } from 'vitest'

export const Netscript = {
    disableLog: vi.fn(),
    getHostname: vi.fn().mockReturnValue('host'),
    getScriptName: vi.fn().mockReturnValue('path/to/script.js'),
    print: vi.fn(),
    tprint: vi.fn()
}
