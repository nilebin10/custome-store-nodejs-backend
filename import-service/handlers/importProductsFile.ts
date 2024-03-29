
import { ImportService } from '../services';
import { APIGatewayEvent, } from 'aws-lambda';
import { createResponse, STATUS_CODE } from '../../product_service/services';

const importService = new ImportService();
export async function importProductFile(event: APIGatewayEvent){

    try{
        const queryString = event.queryStringParameters;
        const { name } = queryString || {};
        if(name){
            const signedUrl = await importService.createPresignedUrl(name);
            return createResponse({ signedUrl }, false, STATUS_CODE.SUCCESS);
        }
        return createResponse({ message: 'Correct key for signed url is not passed' }, true, STATUS_CODE.BAD_REQUEST);

    } catch(error: any){
        const response = createResponse(error, true, error.errorCode ?? STATUS_CODE.INTERNAL_ERROR);
        return response
    }
}