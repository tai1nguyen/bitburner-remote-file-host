export const formatErrorStack = (error: Error | string): string => {
    const isErrorClass = error instanceof Error
    const raw = normalizeError(error)
    const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

    const { header, location, message, stack } = parseLines(lines, isErrorClass)

    return formatOutput(header, location, message, stack, isErrorClass)
}

const normalizeError = (error: Error | string): string => {
    const raw = error instanceof Error ? error.stack! : error

    return raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw
}

const parseLines = (lines: string[], isErrorClass: boolean) => {
    const parseErrorLines = (lines: string[]) => {
        let message: string = 'N/A'
        const header: string = 'ERROR'
        const stack: string[] = []

        lines.forEach((line, index) => {
            // The first line is the message
            // and all lines after it are
            // part of the stack.
            if (index === 0) {
                message = line
            } else {
                stack.push(line)
            }
        })

        return { header, location: undefined, message, stack }
    }

    const parseRuntimeErrorLines = (lines: string[]) => {
        let location: string = 'N/A'
        let message: string = 'N/A'
        const header: string = 'RUNTIME ERROR'
        const stack: string[] = []

        lines.forEach((line, index) => {
            // Ingore the header at index 0.
            if (index !== 0) {
                // Index of the location line.
                if (index === 1) {
                    location = line
                }

                // Index of the message line.
                if (index === 2) {
                    message = line
                }

                // The line at the fourth index is
                // the stack header. Every line
                // after it is a part of the stack.
                if (index > 3) {
                    stack.push(line)
                }
            }
        })

        return { header, location, message, stack }
    }

    return isErrorClass ? parseErrorLines(lines) : parseRuntimeErrorLines(lines)
}

const formatOutput = (
    header: string,
    location: string | undefined,
    message: string,
    stack: string[],
    isErrorClass: boolean
): string => {
    const parts: string[] = []

    parts.push(header)

    if (location) {
        parts.push('Location:')
        parts.push(`  ${location}`)
    }

    parts.push('Message:')
    parts.push(`  ${message}`)

    parts.push('Stack:')
    parts.push(
        ...stack.map((s) => {
            if (isErrorClass) {
                return `  ${s}`
            }

            return `  at ${s}`
        })
    )

    return parts.join('\n')
}
