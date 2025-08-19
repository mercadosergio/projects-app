import { environment } from '@/config/environment';
import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { ddbDocClient } from '@/services/aws/bdconfig';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { userId, username, taskTitle, projectId } = await req.json();

    if (!userId || !projectId) {
      return ErrorResponse('Faltan userId o projectId', 400);
    }

    await ddbDocClient.send(
      new PutCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `TASK#${id}`,
          userId,
          taskId: id,
          projectId
        },
        ConditionExpression: 'attribute_not_exists(PK)'
      })
    );

    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: environment.NOTIFY_LAMBDA,
        InvocationType: 'Event',
        Payload: Buffer.from(
          JSON.stringify({ username, taskTitle, type: 'TASK_COMPLETED' })
        )
      })
    );

    return NextResponse.json(
      { message: 'Tarea asignada con éxito', taskId: id, userId },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return ErrorResponse('El usuario ya está asignado a la tarea', 409);
    }
    console.error(error);
    return ErrorResponse(error.message);
  }
}
