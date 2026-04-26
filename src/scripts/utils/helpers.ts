/**
 * Returns an array of values from the input array filtered by the values provided.
 *
 * @param array The array to inspect.
 * @param values The values to exclude.
 * @returns Returns an array of filtered values.
 */
const difference = <T>(array: T[], values: T[]): T[] => {
    return array.filter((item) => !values.includes(item))
}

const isEmpty = <T>(value: T): boolean => {
    if (value === null) return true
    if (value === undefined) return true
    if (typeof value === 'string' && value.trim().length === 0) return true
    if (Array.isArray(value) && value.length === 0) return true
    if (typeof value === 'object' && Object.keys(value).length === 0)
        return true
    if (value instanceof Set && value.size === 0) return true
    if (value instanceof Map && value.size === 0) return true

    return false
}

export default { difference, isEmpty }
