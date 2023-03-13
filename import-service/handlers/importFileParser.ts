import { S3Event } from 'aws-lambda';
import { createResponse, STATUS_CODE,  } from '../../product_service/services';
import { FilePraserService } from '../services';
import { winstonLogger } from '../../product_service/services/logger.service';

export async function importFileParser(event: S3Event){
    const filePraserService = new FilePraserService();

    try{
        for (const record of event.Records) {
            winstonLogger.logRequest(JSON.stringify(record.s3.object));
           await filePraserService.parseFile(record);
        }

        return createResponse({}, false, STATUS_CODE.SUCCESS)
    } catch(error) {
        return createResponse(error as {}, true, STATUS_CODE.INTERNAL_ERROR);
    }
}