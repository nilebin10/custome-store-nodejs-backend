import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner' 


export class ImportService {

  private bucketName: string | undefined;
  private region: string | undefined;
  constructor(){
    this.initiateVars()
  }

  initiateVars(){
    this.bucketName = process.env.BUCKET_NAME;
    this.region = process.env.REGION;
  }

  async createPresignedUrl(key: string): Promise<any> {
      const client = new S3Client({ region: this.region });
      const command = new PutObjectCommand({ Bucket: this.bucketName, Key: `uploaded/${key}` });
      return getSignedUrl(client, command, { expiresIn: 3600 });
  };
}