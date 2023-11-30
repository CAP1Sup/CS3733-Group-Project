export function successResponse(message: string) {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: message,
    };
}

export function errorResponse(message: string) {
    return {
        statusCode: 400,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: message,
    };
}
