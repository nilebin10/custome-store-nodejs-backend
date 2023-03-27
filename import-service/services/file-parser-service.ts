import { S3Client, GetObjectCommand, GetObjectCommandInput, CopyObjectCommandInput, CopyObjectCommand, DeleteObjectCommandInput, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3EventRecord } from 'aws-lambda';
import csv from 'csv-parser';
import { winstonLogger } from '../../product_service/services/logger.service';
import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';

export class FilePraserService{

    private bucket: string | undefined;
    private region: string | undefined;
    private queueUrl: string | undefined;
    private client!: S3Client;
    private sqsClient!: SQSClient;

    constructor(){
        this.initializeParams();
    }

    initializeParams() {
        this.bucket = process.env.BUCKET_NAME;
        this.region = process.env.REGION;
        this.queueUrl = process.env.SQS_QUEUE_URL;
        this.client = new S3Client({ region: this.region });
        this.sqsClient = new SQSClient({ region: this.region })
    }

    async parseFile(record: S3EventRecord){

        try{
            const key = record.s3.object.key;
            const response = await this.getFile(key);
    
            const readable: any = (response.Body as any).pipe(csv());

            await this.parseResponse(readable);

            const newKey = key.replace('uploaded', 'parsed');
            await this.copyObject(key, newKey);

            await this.deleteObject(key)

        } catch(error) {
            throw(error);
        }

    }

    async getFile(key: string){
        const param: GetObjectCommandInput = {
            Bucket: this.bucket,
            Key: key
        }

        const response = await this.client.send(new GetObjectCommand(param));
        return response;
    }

    async parseResponse(readableStream: any) {
       return new Promise<void>((resolve, reject) => {
            readableStream.on('data', (data: any) => {
                winstonLogger.logRequest(`Data is ${JSON.stringify(data)}`)
                const message: SendMessageCommandInput = {
                    MessageBody: JSON.stringify(data),
                    DelaySeconds: 0,
                    QueueUrl: this.queueUrl
                }
                try {
                    this.sqsClient.send(new SendMessageCommand(message));
                }catch(err:any) {
                    reject(err);
                }
            });
    
            readableStream.on('end',  async () => {
                resolve();
            });

        })
    }

    async copyObject(source: string, target: string){
        winstonLogger.logRequest(`COPYOBJECT:: copying object ot ${target}`);
        const params: CopyObjectCommandInput = {
            Bucket: this.bucket,
            CopySource: `${this.bucket}/${source}`,
            Key: target
        };

        return await this.client.send(new CopyObjectCommand(params));
    }

    async deleteObject(key: string){
        winstonLogger.logRequest(`DELETEOBJECT:: deleting ${key}`);
        const params: DeleteObjectCommandInput = {
            Bucket: this.bucket,
            Key: key
        }

        return await this.client.send(new DeleteObjectCommand(params));
    }
}