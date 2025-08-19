import { NextResponse } from 'next/server';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { environment } from '@/config/environment';
import { ddbDocClient } from '@/services/aws/bdconfig';
import { ErrorResponse } from '@/lib/middlewares/api-responses';

export async function GET() {
  try {
    const resp = await ddbDocClient.send(
      new ScanCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        FilterExpression: 'begins_with(PK, :pk) AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': 'NOTIFICATION#',
          ':sk': 'METADATA#'
        }
      })
    );

    const notifications = resp.Items || [];

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}
