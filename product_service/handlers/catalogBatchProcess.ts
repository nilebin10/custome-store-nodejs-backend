import { SQSEvent } from 'aws-lambda';
import { createResponse, ProductService, STATUS_CODE } from '../services';
import { winstonLogger } from '../services/logger.service';
import { SNSClient, PublishCommand, PublishCommandInput } from '@aws-sdk/client-sns';

export async function catalogBatchProcess(event: SQSEvent){
    const productService = new ProductService();
    const sns = new SNSClient({ region: 'us-east-1' });
    try{
        const topicArn = process.env.SNS_TOPIC_ARN;
        winstonLogger.logRequest(`New Array ${JSON.stringify(event)}`);
        for (let record of event.Records){
            const { body } = record;
            winstonLogger.logRequest(`Record data:: ${body}`);
            const { item : product} = await productService.createProduct(JSON.parse(body));
            winstonLogger.logRequest(`Created Product:: ${JSON.stringify(product)}`);
            if (product?.id) {
                const snsPublishItem: PublishCommandInput = {
                    Message: `Product is added successfully with id ${product.id}`,
                    TopicArn: topicArn
                }
                sns.send(new PublishCommand(snsPublishItem))
            }
        }

        return null;
    } catch(err: any) {
        const response = createResponse(err, true, err.errCode ?? STATUS_CODE.INTERNAL_ERROR);
        return response
    }
}