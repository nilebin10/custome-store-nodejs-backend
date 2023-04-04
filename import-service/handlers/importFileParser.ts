import { S3Event } from 'aws-lambda';
import { createResponse, STATUS_CODE, winstonLogger } from 'shared-services';
import { FilePraserService } from '../services';

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