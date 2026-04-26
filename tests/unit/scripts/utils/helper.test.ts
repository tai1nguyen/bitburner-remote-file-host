import { describe, expect, it } from 'vitest'
import _ from '/scripts/utils/helpers'

describe('_', () => {
    describe('isEmpty()', () => {
        it('should handle null', () => {
            expect(_.isEmpty(null)).toBe(true)
        })

        it('should handle undefined', () => {
            expect(_.isEmpty(undefined)).toBe(true)
        })

        it('should handle strings', () => {
            expect(_.isEmpty('')).toBe(true)
            expect(_.isEmpty('a')).toBe(false)
        })

        it('should handle arrays', () => {
            expect(_.isEmpty([])).toBe(true)
            expect(_.isEmpty(['a'])).toBe(false)
        })

        it('should handle objects', () => {
            expect(_.isEmpty({})).toBe(true)
            expect(_.isEmpty({ a: 'a' })).toBe(false)
        })

        it('should handle sets', () => {
            expect(_.isEmpty(new Set())).toBe(true)
            expect(_.isEmpty(new Set(['a']))).toBe(false)
        })

        it('should handle maps', () => {
            expect(_.isEmpty(new Map())).toBe(true)
            expect(
                _.isEmpty(
                    new Map([
                        ['a', 1],
                        ['b', 2]
                    ])
                )
            ).toBe(false)
        })

        it('should treat numbers as empty', () => {
            expect(_.isEmpty(1)).toBe(true)
        })
    })

    describe('difference()', () => {
        it('should return items not included in the values array', () => {
            const inspect = [1, 2, 3, 4]
            const values = [1, 2, 3]

            expect(_.difference(inspect, values)).toContain(4)
        })
    })
})
