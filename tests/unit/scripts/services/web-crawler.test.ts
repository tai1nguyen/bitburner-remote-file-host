import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NS } from '@ns'
import Mock from '/mocks'
import { WebCrawler } from '/scripts/services/web-crawler'

vi.mock('/scripts/utils/logger', () => Mock.Logger)

describe('WebCrawler', () => {
    describe('start()', () => {
        const mockNetwork: { [key: string]: string[] } = {
            home: ['foo', 'bar'],
            foo: ['home'],
            bar: ['home', 'faz'],
            faz: ['bar', 'baz'],
            baz: ['faz']
        }

        beforeEach(() => {
            Mock.Netscript.sleep.mockResolvedValue(undefined)
            Mock.Netscript.scan.mockImplementation((host: string) => {
                return mockNetwork[host]
            })
        })

        it('should scan the network', async () => {
            const crawler = WebCrawler.Builder.setNetscript(
                Mock.Netscript as unknown as NS
            ).build()

            await crawler.start()
            const result = crawler.getServers()

            expect(result).toEqual(new Set(['foo', 'bar', 'faz', 'baz']))
        })

        it('should add hosts that pass the predicate', async () => {
            const crawler = WebCrawler.Builder.setNetscript(
                Mock.Netscript as unknown as NS
            )
                .setTargetPredicate((host: string) => {
                    return host.includes('b')
                })
                .build()

            await crawler.start()
            const result = crawler.getServers()

            expect(result).toEqual(new Set(['bar', 'baz']))
        })

        it('should execute the handler against every host that passes the predicate', async () => {
            const handler = vi.fn()
            const crawler = WebCrawler.Builder.setNetscript(
                Mock.Netscript as unknown as NS
            )
                .setTargetPredicate((host: string) => {
                    return host.includes('b')
                })
                .setOnTargetFound(handler)
                .build()

            await crawler.start()

            expect(handler).toHaveBeenCalledWith('bar')
            expect(handler).toHaveBeenCalledWith('baz')
        })

        it('should ignore the home server', async () => {
            const crawler = WebCrawler.Builder.setNetscript(
                Mock.Netscript as unknown as NS
            ).build()

            await crawler.start()
            const result = crawler.getServers()

            expect(result).not.toContain('home')
        })

        it('should stop after meeting the count', async () => {
            const crawler = WebCrawler.Builder.setNetscript(
                Mock.Netscript as unknown as NS
            )
                .setTargetPredicate((host: string) => {
                    return host.includes('b')
                })
                .setCount(1)
                .build()

            await crawler.start()
            const result = crawler.getServers()

            expect(result.size).toBe(1)
        })
    })

    describe('logToTerminal()', () => {
        it('should log to terminal', () => {
            const crawler = WebCrawler.Builder.setNetscript(
                Mock.Netscript as unknown as NS
            ).build()

            crawler.logToTerminal(true)

            expect(Mock.Logger.toTerminal).toHaveBeenCalledWith(true)
        })
    })

    describe('Builder', () => {
        it('should build the WebCrawler', () => {
            expect(
                WebCrawler.Builder.setCount(1)
                    .setNetscript(Mock.Netscript as unknown as NS)
                    .setOnTargetFound(vi.fn())
                    .setTargetPredicate(vi.fn())
                    .build()
            ).toBeInstanceOf(WebCrawler)
        })

        it('should throw when Netscript is not provided', () => {
            expect(() => WebCrawler.Builder.build()).toThrow()
        })
    })
})
