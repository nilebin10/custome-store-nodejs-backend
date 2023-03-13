import { S3Client, GetObjectCommand, GetObjectCommandInput, CopyObjectCommandInput, CopyObjectCommand, DeleteObjectCommandInput, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3EventRecord } from 'aws-lambda';
import csv from 'csv-parser';
import { winstonLogger } from '../../product_service/services/logger.service';

export class FilePraserService{

    private bucket: string | undefined;
    private region: string | undefined;
    private client!: S3Client;

    constructor(){
        this.initializeParams();
    }

    initializeParams() {
        winstonLogger.logRequest(`Env is ${JSON.stringify(process.env)}`);
        this.bucket = process.env.BUCKET_NAME;
        this.region = process.env.REGION;
        this.client = new S3Client({ region: this.region });

        winstonLogger.logRequest(`BUcket is ${this.bucket}`);
    }

    async parseFile(record: S3EventRecord){

        try{
            const key = record.s3.object.key;
            const response = await this.getFile(key);
    
            const readable: any = (response.Body as any).pipe(csv());

            await this.parseResponse(readable, key);

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

    async parseResponse(readableStream: any, key: string) {
       return new Promise<void>((resolve, reject) => {
            readableStream.on('data', (data: any) => {
                console.log(data);
            });
    
            readableStream.on('end',  async () => {
                try{
                    const newKey = key.replace('uploaded', 'parsed');
                    await this.copyObject(key, newKey);
        
                    await this.deleteObject(key)

                    resolve();
                }catch(error) {
                    reject(error);
                }
            });

        })
    }

    async copyObject(source: string, target: string){
        winstonLogger.logRequest(`copyObject bucket ${this.bucket}`);
        const params: CopyObjectCommandInput = {
            Bucket: this.bucket,
            CopySource: `${this.bucket}/${source}`,
            Key: target
        };

        return await this.client.send(new CopyObjectCommand(params));
    }

    async deleteObject(key: string){
        winstonLogger.logRequest(`deleteObject bucket ${this.bucket}`);
        const params: DeleteObjectCommandInput = {
            Bucket: this.bucket,
            Key: key
        }

        return await this.client.send(new DeleteObjectCommand(params));
    }
}