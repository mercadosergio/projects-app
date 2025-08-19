import { environment } from '@/config/environment';
import { ddbDocClient } from '@/services/aws/bdconfig';
import { NextResponse } from 'next/server';
import {
  UpdateCommand,
  GetCommand,
  QueryCommand,
  BatchGetCommand
} from '@aws-sdk/lib-dynamodb';
import { ErrorResponse } from '@/lib/middlewares/api-responses';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { title, description, status, priority, dueDate, projectId } =
      await req.json();

    if (
      !title ||
      !description ||
      !status ||
      !priority ||
      !dueDate ||
      !projectId
    ) {
      return ErrorResponse('Campos faltantes', 400);
    }

    await ddbDocClient.send(
      new UpdateCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${projectId}`,
          SK: `TASK#${id}`
        },
        UpdateExpression:
          'SET #title = :t, #desc = :d, #status = :s, #priority = :p, #due = :due',
        ExpressionAttributeNames: {
          '#title': 'title',
          '#desc': 'description',
          '#status': 'status',
          '#priority': 'priority',
          '#due': 'dueDate'
        },
        ExpressionAttributeValues: {
          ':t': title,
          ':d': description,
          ':s': status,
          ':p': priority,
          ':due': dueDate
        }
      })
    );

    return NextResponse.json(
      { message: 'Tarea actualizada con éxito', taskId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}
