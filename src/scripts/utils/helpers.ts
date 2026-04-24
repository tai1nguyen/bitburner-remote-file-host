/**
 * Returns the provided array filtered by the values provided.
 *
 * @param array The array to inspect.
 * @param values The values to exclude.
 * @returns Returns an array of filtered values.
 */
const difference = <T>(array: T[], values: T[]): T[] => {
    return array.filter((item) => !values.includes(item))
}

export default { difference }
