import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand, BatchWriteCommandInput, BatchWriteCommandOutput, 
  DynamoDBDocumentClient,
  QueryCommand, QueryCommandInput, QueryCommandOutput, 
  PutCommand, PutCommandInput, PutCommandOutput,
  ScanCommand, ScanCommandInput, ScanCommandOutput
} from "@aws-sdk/lib-dynamodb";
import { winstonLogger } from '../logger.service';

export interface IDynamo {
  TableName: string;
  config?: Record<string, any>;
}

export class DynamoBaseClass {
  private REGION = "us-east-1";
  public dbclient: DynamoDBClient;
  constructor(config?: any) {
    this.dbclient = new DynamoDBClient({
      region: this.REGION,
      ...config,
    });
  }
  static createDocumentClient(client: DynamoDBClient, translateConfig: any) {
    return DynamoDBDocumentClient.from(client, translateConfig);
  }
}

export class Dynamo<T> extends DynamoBaseClass {
  params: IDynamo;
  private dbDocumentClient: DynamoDBDocumentClient;

  private marshallOptions = {
    convertEmptyValues: false, // false, by default.
    removeUndefinedValues: false, // false, by default.
    convertClassInstanceToMap: false, // false, by default.
  };
  
  private unmarshallOptions = {
    wrapNumbers: false, // false, by default.
  };
  
  private translateConfig = { marshallOptions: this.marshallOptions, unmarshallOptions:  this.unmarshallOptions };
  constructor(params: any, config?: any) {
    super(config);
    this.params = { ...params };
    this.dbDocumentClient = DynamoBaseClass.createDocumentClient(this.dbclient, this.translateConfig);
  }

  get tableName() {
    return {
        TableName: this.params.TableName
    }
  }

  async populateTable(itemData: T[]){
    try{
      await this.clearTableData();
      if (itemData && itemData.length > 0) {
        const param: BatchWriteCommandInput = {
          RequestItems: {
            [this.params.TableName]: itemData?.map((item: any) => ({
              PutRequest: {
                Item: {...item}
              },
            })),
          },
        };
        const data: BatchWriteCommandOutput = await this.dbDocumentClient.send(new BatchWriteCommand(param));
        return data.$metadata.httpStatusCode;
      } else {
        throw new Error('Provide valid data to populate table');
      }
    }catch(err){
      return Promise.reject(err);
    }
  }

  async getTableData(): Promise<T[] | undefined> {
    try {
      const param: ScanCommandInput = { ...this.tableName};
      const data: ScanCommandOutput = await this.dbDocumentClient.send(new ScanCommand(param));
      return data.Items as T[];
    } catch(err){
      return Promise.reject(err);
    }
  }

  async clearTableData() {
    try {
      const tableData = await this.getTableData();
      if (tableData && tableData.length > 0) {
        const { p_key, s_key} = this.params.config as any;
        const param: BatchWriteCommandInput = {
          RequestItems: {
            [this.params.TableName]: tableData.map((item:any) => ({
              DeleteRequest: {
                Key: {
                  [p_key]:  item[p_key],
                  [s_key]:  item[s_key],
                } 
              },
            })),
          },
        };
        const data: BatchWriteCommandOutput = await this.dbDocumentClient.send(new BatchWriteCommand(param));
        return data.$metadata.httpStatusCode;
      }
      return 200;
    } catch(err){
      return Promise.reject(err);
    }
  }

  async createItem(item: T) {
    try{
      const param: PutCommandInput = {
        TableName: this.params.TableName,
        Item: {...item} as any
      };
  
      const data: PutCommandOutput = await this.dbDocumentClient.send(new PutCommand(param));
      return data.$metadata.httpStatusCode;
    }catch(err){
      return Promise.reject(err);
    }
  }

  async getItem(id: string): Promise<T> {
    try{
      const { p_key } = this.params.config as any;
      winstonLogger.logRequest(`Request for ${this.params.TableName} with id ${id} and key ${p_key}`)
      const param: QueryCommandInput = {
        TableName: this.params.TableName,
          ExpressionAttributeValues: {
            ":s": id,
          },
          KeyConditionExpression: `${p_key} = :s`
        };
      const data: QueryCommandOutput = await this.dbDocumentClient.send(new QueryCommand(param));
      return data.Items?.[0] as any || null;
    } catch(err){
      winstonLogger.logError(JSON.stringify(err));
      return Promise.reject(err);
    }
  }
}
