import { Server } from '@ns'

export const logSysInfo = ({ tprint, server }: { tprint: (output: string) => void, server: Server }) => {
    tprint('------------------------------------')
    tprint('Server Infomation')
    tprint('------------------------------------')
    tprint(`Host Name: ${server.hostname}`)
    tprint(`IP: ${server.ip}`)
    tprint('')
    tprint(`Min Security level: ${server.minDifficulty}`)
    tprint(`Current security: ${server.hackDifficulty}`)
    tprint('')
    tprint(`Max Money: ${server.moneyMax}`)
    tprint(`Current Money: ${server.moneyAvailable}`)
    tprint(`Server Growth: ${server.serverGrowth}`)
    tprint('')
}