import { environment } from '@/config/environment';
import { ddbDocClient } from '@/services/aws/bdconfig';
import { NextResponse } from 'next/server';
import {
  BatchWriteCommand,
  QueryCommand,
  UpdateCommand
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

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const taskResp = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        IndexName: 'TaskByProject',
        KeyConditionExpression: 'taskId = :tid',
        ExpressionAttributeValues: { ':tid': id },
        Limit: 1
      })
    );

    if (!taskResp.Items || taskResp.Items.length === 0) {
      return ErrorResponse('Tarea no encontrada', 404);
    }

    const task = taskResp.Items[0];
    const projectId = task.projectId;

    const assigneesResp = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        IndexName: 'TaskUser',
        KeyConditionExpression: 'taskId = :tid',
        ExpressionAttributeValues: { ':tid': id }
      })
    );

    const assigneeRelations = assigneesResp.Items || [];
    if (assigneeRelations.length > 0) {
      const deleteReqs = assigneeRelations.map((rel) => ({
        DeleteRequest: {
          Key: {
            PK: `USER#${rel.userId}`,
            SK: `TASK#${id}`
          }
        }
      }));

      for (let i = 0; i < deleteReqs.length; i += 25) {
        await ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [environment.DYNAMODB_TABLENAME]: deleteReqs.slice(i, i + 25)
            }
          })
        );
      }
    }

    await ddbDocClient.send(
      new DeleteCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${projectId}`,
          SK: `TASK#${id}`
        }
      })
    );

    return NextResponse.json(
      {
        message: 'Tarea eliminada correctamente',
        taskId: id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}
