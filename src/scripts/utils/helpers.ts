/**
 * Creates an array of values not present in the provided arrays.
 *
 * @param array The array to inspect.
 * @param values The values to exclude.
 * @returns Returns an array of filtered values.
 */
const difference = <T>(array: T[], values: T[]): T[] => {
    return array.filter((item) => !values.includes(item))
}

export default { difference }
