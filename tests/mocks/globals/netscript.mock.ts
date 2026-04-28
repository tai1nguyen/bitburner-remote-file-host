import { vi } from 'vitest'

export const Netscript = {
    args: [] as string[],
    // port openers
    brutessh: vi.fn(),
    ftpcrack: vi.fn(),
    relaysmtp: vi.fn(),
    httpworm: vi.fn(),
    sqlinject: vi.fn(),
    nuke: vi.fn(),

    // grow/hack/weaken
    grow: vi.fn(),
    hack: vi.fn(),
    weaken: vi.fn(),

    // player stats
    getPlayer: vi.fn(),

    // cloud server
    getPurchasedServerCost: vi.fn(),
    getPurchasedServerLimit: vi.fn(),
    upgradePurchasedServer: vi.fn(),
    purchaseServer: vi.fn(),

    disableLog: vi.fn(),
    getHostname: vi.fn().mockReturnValue('host'),
    getScriptName: vi.fn().mockReturnValue('path/to/script.js'),
    print: vi.fn(),
    tprint: vi.fn(),
    clearLog: vi.fn(),
    fileExists: vi.fn(),
    getServer: vi.fn(),
    ls: vi.fn(),
    scp: vi.fn(),
    sleep: vi.fn(),
    ps: vi.fn(),
    killall: vi.fn(),
    exec: vi.fn(),
    getScriptRam: vi.fn(),
    scan: vi.fn(),
    scriptKill: vi.fn()
}
