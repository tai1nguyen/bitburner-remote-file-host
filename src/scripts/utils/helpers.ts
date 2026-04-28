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

/**
 * Takes a value and returns true or false depending on whether or
 * not the value is empty. Treats primitive numbers as being empty.
 *
 * @param value
 * @returns Returns a boolean. True if value is empty, false otherwise.
 */
const isEmpty = <T>(value: T): boolean => {
    if (value === null) return true
    if (value === undefined) return true

    if (typeof value === 'string') {
        return value.trim().length === 0
    }

    if (Array.isArray(value)) {
        return value.length === 0
    }

    if (value instanceof Set) {
        return value.size === 0
    }

    if (value instanceof Map) {
        return value.size === 0
    }

    if (typeof value === 'object') {
        return Object.keys(value).length === 0
    }

    return true
}

export default { difference, isEmpty }
