import { vi } from 'vitest'

export const Netscript = {
    args: [] as string[],
    disableLog: vi.fn(),
    getHostname: vi.fn().mockReturnValue('host'),
    getScriptName: vi.fn().mockReturnValue('path/to/script.js'),
    print: vi.fn(),
    tprint: vi.fn(),
    clearLog: vi.fn(),
    fileExists: vi.fn(),

    // port openers
    brutessh: vi.fn(),
    ftpcrack: vi.fn(),
    relaysmtp: vi.fn(),
    httpworm: vi.fn(),
    sqlinject: vi.fn(),
    nuke: vi.fn()
}
