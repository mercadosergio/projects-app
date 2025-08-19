import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { NextResponse } from 'next/server';
import { environment } from '@/config/environment';
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { ddbDocClient, lambdaClient } from '@/services/aws/bdconfig';
import { v4 as uuid } from 'uuid';

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    const { taskTitle, projectName, projectId, status } = await req.json();

    const results = await ddbDocClient.send(
      new UpdateCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${projectId}`,
          SK: `TASK#${id}`
        },
        UpdateExpression: 'set #s = :s',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': status }
      })
    );

    if (
      status == 'COMPLETED' &&
      results.Attributes &&
      results.Attributes.status === 'COMPLETED'
    ) {
      const notificationId = uuid();
      const createdAt = new Date().toISOString();

      await ddbDocClient.send(
        new PutCommand({
          TableName: environment.DYNAMODB_TABLENAME,
          Item: {
            PK: `NOTIFICATION#${id}`,
            SK: `METADATA#${id}`,
            createdAt,
            id: notificationId,
            projectId,
            type: 'TASK_COMPLETED',
            message: `La tarea ${taskTitle} ha sido completada`,
            channel: 'websocket'
          }
        })
      );

      const lambda = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: environment.NOTIFY_LAMBDA,
          InvocationType: 'Event',
          Payload: Buffer.from(
            JSON.stringify({ projectName, taskTitle, type: 'TASK_COMPLETED' })
          )
        })
      );

      return NextResponse.json(
        {
          message: 'Tarea completada',
          taskId: id
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cambio realizado exitosamente',
        taskId: id
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return ErrorResponse(error.message);
  }
}
