import { environment } from '@/config/environment';
import { ddbDocClient } from '@/services/aws/bdconfig';
import { NextResponse } from 'next/server';
import {
  GetCommand,
  QueryCommand,
  BatchGetCommand
} from '@aws-sdk/lib-dynamodb';
import { ErrorResponse } from '@/lib/middlewares/api-responses';

export async function GET(req, { params }) {
  try {
    const { id, projectId } = params;

    const taskResp = await ddbDocClient.send(
      new GetCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${projectId}`,
          SK: `TASK#${id}`
        }
      })
    );

    if (!taskResp.Item) {
      return ErrorResponse('Tarea no encontrada', 404);
    }

    const task = taskResp.Item;

    const assigneeResp = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        IndexName: 'UserTask',
        KeyConditionExpression: 'taskId = :tid',
        ExpressionAttributeValues: { ':tid': id }
      })
    );

    const relations = assigneeResp.Items || [];
    let assignees = [];

    if (relations.length > 0) {
      const userKeys = relations.map((rel) => ({
        PK: `USER#${rel.userId}`,
        SK: `METADATA#${rel.userId}`
      }));

      const usersResp = await ddbDocClient.send(
        new BatchGetCommand({
          RequestItems: {
            [environment.DYNAMODB_TABLENAME]: {
              Keys: userKeys
              //   ProjectionExpression: 'PK, SK, name, avatar, email'
            }
          }
        })
      );

      assignees =
        usersResp.Responses?.[environment.DYNAMODB_TABLENAME].map((user) => ({
          id: user.PK.split('#')[1],
          name: user.name,
          avatar: user.avatar,
          email: user.email
        })) || [];
    }

    const projectResp = await ddbDocClient.send(
      new GetCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${projectId}`,
          SK: `METADATA#${projectId}`
        }
      })
    );

    const project = projectResp.Item
      ? {
          id: projectResp.Item.PK.split('#')[1],
          name: projectResp.Item.name,
          description: projectResp.Item.description,
          dueDate: projectResp.Item.dueDate
        }
      : null;

    return NextResponse.json({
      ...task,
      id: id,
      project,
      assignees
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}
