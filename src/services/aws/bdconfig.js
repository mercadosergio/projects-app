// 'server only';

import { environment } from '@/config/environment';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const REGION = environment.AWS_REGION;

if (!environment.AWS_ACCESS_KEY_ID || !environment.AWS_SECRET_KEY) {
  throw new Error('Cannot read db variables');
}

const dbconfig = {
  region: REGION,
  credentials: {
    accessKeyId: environment.AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.AWS_SECRET_KEY
  }
};

const dbClient = new DynamoDBClient(dbconfig);

const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false
};

const unmarshallOptions = {
  wrapNumbers: false
};

const translateConfig = {
  marshallOptions,
  unmarshallOptions
};

const ddbDocClient = DynamoDBDocumentClient.from(dbClient, translateConfig);
const TABLE_NAME = environment.DYNAMODB_TABLENAME;

export { ddbDocClient, TABLE_NAME };
