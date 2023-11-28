export function throwError(message: string) {
    return {
        statusCode: 400,
        body: message,
    };
}
