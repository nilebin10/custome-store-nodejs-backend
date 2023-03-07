export enum STATUS_CODE {
    NOT_FOUND = 404,
    INTERNAL_ERROR = 501,
    SUCCESS = 200,
    BAD_REQUEST = 400
}

export type Response = {
    statusCode: STATUS_CODE,
    headers: Record<string, any>,
    body: string,
}

export type ErrorObject = {
    message: String,
    errorCode: Omit<STATUS_CODE, 'SUCCESS'>
}

export function createResponse(
    data: Record<string, any> | ErrorObject | null | any[], 
    isError: boolean, 
    statusCode: STATUS_CODE,
    message?: string): Response {
    if(isError) {
        const { message: errorMsg, ...errObj } = data as ErrorObject
        return {
            statusCode: statusCode,
            body: JSON.stringify({ err: errObj, message: errorMsg ? errorMsg : message || 'Unexpected error occured' }),
            headers: {...getHeaders()}
        }
    }

    return {
        statusCode: statusCode,
        body: JSON.stringify(data),
        headers: {...getHeaders()}
    }
}

function getHeaders():Record<string, any> {
    return {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    }
}