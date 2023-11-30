export function successResponse(message: string) {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", //DO NOT USE THIS VALUE IN PRODUCTION - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: message,
    };
}

export function errorResponse(message: string) {
    return {
        statusCode: 400,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", //DO NOT USE THIS VALUE IN PRODUCTION - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: message,
    };
}
